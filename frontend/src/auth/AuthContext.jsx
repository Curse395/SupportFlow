import { useCallback, useEffect, useMemo, useState } from 'react'
import apiClient from '../api/client'
import { AuthContext } from './context'

const TOKEN_KEY = 'supportflow.accessToken'
function readToken() {
  return typeof window === 'undefined' ? null : window.sessionStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const setSession = useCallback((authResponse) => {
    window.sessionStorage.setItem(TOKEN_KEY, authResponse.access_token)
    setToken(authResponse.access_token)
    setUser(authResponse.user)
    setReady(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      if (!token) {
        setReady(true)
        return
      }
      try {
        const response = await apiClient.get('/api/auth/me')
        if (!cancelled) setUser(response.data)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [clearSession, token])

  useEffect(() => {
    const handleUnauthorized = () => clearSession()
    window.addEventListener('supportflow:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('supportflow:unauthorized', handleUnauthorized)
  }, [clearSession])

  const value = useMemo(() => ({
    token,
    user,
    ready,
    setSession,
    logout: clearSession,
  }), [token, user, ready, setSession, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
