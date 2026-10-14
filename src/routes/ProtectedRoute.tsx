import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'

interface ProtectedRouteProps {
  requiresAdmin?: boolean
}

export function ProtectedRoute({ requiresAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiresAdmin && user?.role.name !== 'admin') {
    return <Navigate to="/user/orders" replace />
  }

  return <Outlet />
}