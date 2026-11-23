import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import useAuth from '../auth/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { token, setSession } = useAuth()
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (token) return <Navigate to="/" replace />

  const isRegistering = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login'
      const payload = isRegistering
        ? { full_name: fullName, email, password }
        : { email, password }
      const response = await apiClient.post(endpoint, payload)
      setSession(response.data)
      navigate('/', { replace: true })
    } catch (requestError) {
      const detail = requestError.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Unable to authenticate. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          {isRegistering ? 'Create your account' : 'Login'}
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          {isRegistering ? 'Register to access the SupportFlow workspace.' : 'Sign in to access the SupportFlow workspace.'}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                autoComplete="name"
                required
                maxLength={100}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
              minLength={isRegistering ? 12 : 1}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            {isRegistering && <span className="mt-1 block text-xs font-normal text-slate-500">Use at least 12 characters.</span>}
          </label>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isRegistering ? 'Already have an account?' : 'New to SupportFlow?'}{' '}
          <button
            type="button"
            className="font-medium text-blue-700 hover:underline"
            onClick={() => {
              setMode(isRegistering ? 'login' : 'register')
              setError('')
            }}
          >
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  )
}
