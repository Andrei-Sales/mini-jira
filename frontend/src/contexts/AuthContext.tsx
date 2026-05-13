import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type LoginPayload, type RegisterPayload } from '../api/authApi'
import type { User } from '../types'
import { clearToken, getToken, setToken } from '../utils/storage'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return
    }

    try {
      const profile = await authApi.profile()
      setUser(profile)
    } catch {
      clearToken()
      setTokenState(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!getToken()) {
        if (mounted) setLoading(false)
        return
      }

      await refreshProfile()
      if (mounted) setLoading(false)
    }

    init()

    const handleExternalLogout = () => {
      clearToken()
      setTokenState(null)
      setUser(null)
    }

    window.addEventListener('auth:logout', handleExternalLogout)

    return () => {
      mounted = false
      window.removeEventListener('auth:logout', handleExternalLogout)
    }
  }, [refreshProfile])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload)
    setToken(response.token)
    setTokenState(response.token)
    await refreshProfile()
  }, [refreshProfile])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload)
    setToken(response.token)
    setTokenState(response.token)
    await refreshProfile()
  }, [refreshProfile])

  const logout = useCallback(async () => {
    try {
      if (getToken()) {
        await authApi.logout()
      }
    } finally {
      clearToken()
      setTokenState(null)
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    refreshProfile,
  }), [user, token, loading, login, register, logout, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
