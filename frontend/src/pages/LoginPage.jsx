import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  function handleLogin() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userName', 'Admin')
      window.localStorage.setItem('userRole', 'Support Manager')
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Login</h2>
        <p className="mb-6 text-sm text-slate-600">Use the button below to sign in as a mock user.</p>
        <button
          onClick={handleLogin}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Sign in as Admin
        </button>
      </div>
    </div>
  )
}
