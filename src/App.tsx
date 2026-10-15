import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { UserLayout } from '@/components/layout/UserLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Public pages
import { LandingPage } from '@/pages/LandingPage'
import { TicketBrowsePage } from '@/pages/TicketBrowsePage'
import { TicketDetailPublicPage } from '@/pages/TicketDetailPublicPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { VerifyOtpPage } from '@/features/auth/pages/VerifyOtpPage'

// User pages
import { OrderListPage } from '@/features/orders/pages/OrderListPage'
import { CheckoutPage } from '@/features/orders/pages/CheckoutPage'
import { MyTicketsPage } from '@/features/purchased-tickets/pages/MyTicketsPage'
import { MyTicketDetailPage } from '@/features/purchased-tickets/pages/MyTicketDetailPage'
import { SupportListPage } from '@/features/support/pages/SupportListPage'
import { CreateSupportPage } from '@/features/support/pages/CreateSupportPage'
import { SupportChatPage } from '@/features/support/pages/SupportChatPage'
import { ProfilePage } from '@/features/users/pages/ProfilePage'
import { NotificationsPage } from '@/features/users/pages/NotificationsPage'

// Admin pages
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminUsersPage } from '@/features/rbac/pages/AdminUsersPage'
import { AdminRolesPage } from '@/features/rbac/pages/AdminRolesPage'
import { AdminTicketsPage } from '@/features/tickets/pages/AdminTicketsPage'
import { AdminOrdersPage } from '@/features/orders/pages/AdminOrdersPage'
import { AdminPaymentsPage } from '@/features/payments/pages/AdminPaymentsPage'
import { AdminSupportPage } from '@/features/admin/pages/AdminSupportPage'
import { AdminLogsPage } from '@/features/logging/pages/AdminLogsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes with PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tickets" element={<TicketBrowsePage />} />
            <Route path="/tickets/:id" element={<TicketDetailPublicPage />} />
          </Route>

          {/* Auth pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* User protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/user/orders" element={<OrderListPage />} />
              <Route path="/user/checkout/:orderId" element={<CheckoutPage />} />
              <Route path="/user/tickets" element={<MyTicketsPage />} />
              <Route path="/user/tickets/:id" element={<MyTicketDetailPage />} />
              <Route path="/user/support" element={<SupportListPage />} />
              <Route path="/user/support/new" element={<CreateSupportPage />} />
              <Route path="/user/support/:id" element={<SupportChatPage />} />
              <Route path="/user/profile" element={<ProfilePage />} />
              <Route path="/user/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* Admin protected routes */}
          <Route element={<ProtectedRoute requiresAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/roles" element={<AdminRolesPage />} />
              <Route path="/admin/tickets" element={<AdminTicketsPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/support" element={<AdminSupportPage />} />
              <Route path="/admin/logs" element={<AdminLogsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  )
}