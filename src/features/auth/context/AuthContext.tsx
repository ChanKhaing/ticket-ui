import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/types'
import { MOCK_USER, MOCK_ADMIN } from '@/data/mock'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

interface RegisterInput {
  email: string
  password: string
  fullName: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const PJA_USER_KEY = 'pja_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PJA_USER_KEY)
      if (stored) {
        setUser(JSON.parse(stored) as User)
      }
    } catch {
      localStorage.removeItem(PJA_USER_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600))

    let resolvedUser: User

    if (email === 'admin@pja.com') {
      resolvedUser = MOCK_ADMIN
    } else if (password === 'password123') {
      resolvedUser = { ...MOCK_USER, email }
    } else {
      throw new Error('Invalid email or password. Use password: password123')
    }

    localStorage.setItem(PJA_USER_KEY, JSON.stringify(resolvedUser))
    setUser(resolvedUser)
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(PJA_USER_KEY)
    setUser(null)
  }, [])

  const register = useCallback(
    async (input: RegisterInput) => {
      await new Promise((r) => setTimeout(r, 600))
      // After register, auto-login as mock user
      await login(input.email, 'password123')
    },
    [login],
  )

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem(PJA_USER_KEY, JSON.stringify(updated))
      return updated
    })
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