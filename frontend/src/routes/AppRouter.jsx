import { Navigate, Route, Routes } from 'react-router-dom'
import useAuth from '../auth/useAuth'
import Layout from '../components/layout/Layout'
import DashboardPage from '../pages/DashboardPage'
import TicketsPage from '../pages/TicketsPage'
import ReportsPage from '../pages/ReportsPage'
import LoginPage from '../pages/LoginPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<DashboardPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  )
}

function RequireAuth({ children }) {
  const { token, ready } = useAuth()
  if (!ready) return <div className="p-6 text-sm text-slate-600">Checking session...</div>
  return token ? children : <Navigate to="/login" replace />
}
