import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/types'
import { authService } from '../services/auth.service'
import type { RegisterInput } from '../services/auth.api'
import { normalizeUser } from '../services/auth.api'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  updateUser: (updates: Partial<User>) => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const PJA_USER_KEY = 'pja_user'

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
    const backendMsg = axiosErr.response?.data?.error?.message || axiosErr.response?.data?.message;
    if (backendMsg) return backendMsg;
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore user from localStorage on mount & verify session
  useEffect(() => {
    async function initAuth() {
      try {
        const stored = localStorage.getItem(PJA_USER_KEY)
        const token = localStorage.getItem('accessToken')

        if (stored && token) {
          const parsed = JSON.parse(stored)
          const normalized = normalizeUser(parsed)
          setUser(normalized)

          // Background revalidation
          authService.getMe()
            .then((freshUser) => {
              const freshNormalized = normalizeUser(freshUser)
              setUser(freshNormalized)
              localStorage.setItem(PJA_USER_KEY, JSON.stringify(freshNormalized))
            })
            .catch(() => {
              // Ignore background fetch error, keep local session
            })
        }
      } catch {
        localStorage.removeItem(PJA_USER_KEY)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authService.login({ email, password })
      const normalized = normalizeUser(res.user)

      localStorage.setItem('accessToken', res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      localStorage.setItem(PJA_USER_KEY, JSON.stringify(normalized))

      setUser(normalized)
    } catch (err) {
      throw new Error(extractErrorMessage(err))
    }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken') || undefined
    try {
      await authService.logout(refreshToken)
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem(PJA_USER_KEY)
      setUser(null)
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const res = await authService.register(input)
      const normalized = normalizeUser(res.user)

      localStorage.setItem('accessToken', res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      localStorage.setItem(PJA_USER_KEY, JSON.stringify(normalized))

      setUser(normalized)
    } catch (err) {
      throw new Error(extractErrorMessage(err))
    }
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = normalizeUser({ ...prev, ...updates })
      localStorage.setItem(PJA_USER_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const freshUser = await authService.getMe()
      const normalized = normalizeUser(freshUser)
      setUser(normalized)
      localStorage.setItem(PJA_USER_KEY, JSON.stringify(normalized))
    } catch {
      // Silent error
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}