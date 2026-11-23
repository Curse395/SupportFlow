from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.enums.user_role import UserRole
from app.main import app
from app.models.user import User


@pytest.fixture
def db_session_factory():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    yield factory
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def client(db_session_factory):
    def override_get_db():
        db = db_session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def register(client, email="person@example.com", password="correct horse battery staple"):
    return client.post(
        "/api/auth/register",
        json={"email": email, "full_name": "Support Person", "password": password},
    )


def test_registration_persists_argon2_hash_and_returns_token(client, db_session_factory):
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "person@example.com"
    assert body["user"]["role"] == UserRole.SUPPORT_AGENT.value
    assert "hashed_password" not in body["user"]

    with db_session_factory() as db:
        user = db.query(User).one()
        assert user.hashed_password.startswith("$argon2id$")
        assert user.hashed_password != "correct horse battery staple"
        assert user.is_active is True


def test_registration_rejects_duplicate_email_case_insensitively(client):
    assert register(client).status_code == 201
    response = register(client, email="PERSON@example.com")
    assert response.status_code == 409


def test_registration_cannot_assign_privileged_role(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "person@example.com",
            "full_name": "Support Person",
            "password": "correct horse battery staple",
            "role": "Admin",
        },
    )
    assert response.status_code == 422


def test_support_agent_cannot_list_agents(client):
    auth = register(client).json()
    response = client.get(
        "/api/auth/agents",
        headers={"Authorization": f"Bearer {auth['access_token']}"},
    )
    assert response.status_code == 403


def test_login_accepts_valid_password_and_rejects_invalid_password(client):
    assert register(client).status_code == 201
    valid = client.post(
        "/api/auth/login",
        json={"email": "PERSON@example.com", "password": "correct horse battery staple"},
    )
    invalid = client.post(
        "/api/auth/login",
        json={"email": "person@example.com", "password": "wrong password"},
    )
    assert valid.status_code == 200
    assert invalid.status_code == 401


def test_current_user_requires_and_validates_bearer_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-token"}).status_code == 401

    auth = register(client).json()
    current_user = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {auth['access_token']}"},
    )
    assert current_user.status_code == 200
    assert current_user.json()["id"] == auth["user"]["id"]

    valid_token = auth["access_token"]
    tampered_token = valid_token[:-1] + ("A" if valid_token[-1] != "A" else "B")
    tampered = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert tampered.status_code == 401


def test_expired_token_is_unauthorized(client, db_session_factory):
    with db_session_factory() as db:
        user = User(
            email="expired@example.com",
            full_name="Expired User",
            hashed_password=get_password_hash("correct horse battery staple"),
            role=UserRole.SUPPORT_AGENT,
            is_active=True,
        )
        db.add(user)
        db.commit()
        user_id = str(user.id)

    token = create_access_token(user_id, expires_delta=timedelta(seconds=-1))
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_inactive_account_is_unauthorized(client, db_session_factory):
    with db_session_factory() as db:
        user = User(
            email="disabled@example.com",
            full_name="Disabled User",
            hashed_password=get_password_hash("correct horse battery staple"),
            role=UserRole.SUPPORT_AGENT,
            is_active=False,
        )
        db.add(user)
        db.commit()
        token = create_access_token(str(user.id))

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_ticket_reads_require_login_and_viewers_cannot_write(client, db_session_factory):
    assert client.get("/api/tickets/").status_code == 401

    with db_session_factory() as db:
        viewer = User(
            email="viewer@example.com",
            full_name="Read Only",
            hashed_password=get_password_hash("correct horse battery staple"),
            role=UserRole.VIEWER,
            is_active=True,
        )
        db.add(viewer)
        db.commit()
        token = create_access_token(str(viewer.id))

    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/tickets/", headers=headers).status_code == 200
    create_response = client.post(
        "/api/tickets/",
        headers=headers,
        json={
            "customer_name": "Example Customer",
            "customer_email": "customer@example.com",
            "subject": "Test ticket",
            "description": "A test ticket",
        },
    )
    assert create_response.status_code == 403


def test_roles_enforce_ticket_write_boundaries_and_allow_shared_reads(client, db_session_factory):
    auth = register(client).json()
    headers = {"Authorization": f"Bearer {auth['access_token']}"}
    created = client.post(
        "/api/tickets/",
        headers=headers,
        json={
            "customer_name": "Example Customer",
            "customer_email": "customer@example.com",
            "subject": "Test ticket",
            "description": "A test ticket",
        },
    )
    assert created.status_code == 201
    assert client.get("/api/dashboard/stats", headers=headers).status_code == 200
    assert client.get("/api/reports/monthly-summary", headers=headers).status_code == 200

    with db_session_factory() as db:
        viewer = User(
            email="viewer@example.com",
            full_name="Read Only",
            hashed_password=get_password_hash("correct horse battery staple"),
            role=UserRole.VIEWER,
            is_active=True,
        )
        db.add(viewer)
        db.commit()
        viewer_token = create_access_token(str(viewer.id))

    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}
    ticket_id = created.json()["ticket_id"]
    assert client.get(f"/api/tickets/{ticket_id}", headers=viewer_headers).status_code == 200
    assert client.get("/api/reports/monthly-summary", headers=viewer_headers).status_code == 200
    denied_update = client.put(
        f"/api/tickets/{ticket_id}",
        headers=viewer_headers,
        json={"status": "Closed"},
    )
    assert denied_update.status_code == 403


def test_auth_api_accepts_production_frontend_cors_preflight(client):
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "https://support-flow-bay.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://support-flow-bay.vercel.app"
