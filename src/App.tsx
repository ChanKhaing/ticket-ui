import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { UserLayout } from '@/components/layout/UserLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Public
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyOtpPage } from '@/features/auth/pages/VerifyOtpPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

// User
import { DashboardPage } from '@/features/users/pages/DashboardPage';
import { ProfilePage } from '@/features/users/pages/ProfilePage';
import { TicketListPage } from '@/features/tickets/pages/TicketListPage';
import { TicketDetailPage } from '@/features/tickets/pages/TicketDetailPage';
import { OrderListPage } from '@/features/orders/pages/OrderListPage';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';
import { PaymentListPage } from '@/features/payments/pages/PaymentListPage';
import { MyTicketsPage } from '@/features/purchased-tickets/pages/MyTicketsPage';

// Admin
import { AdminOverviewPage } from '@/features/logging/pages/AdminOverviewPage';
import { AdminUsersPage } from '@/features/rbac/pages/AdminUsersPage';
import { AdminRolesPage } from '@/features/rbac/pages/AdminRolesPage';
import { AdminPermissionsPage } from '@/features/rbac/pages/AdminPermissionsPage';
import { AdminTicketsPage } from '@/features/tickets/pages/AdminTicketsPage';
import { AdminOrdersPage } from '@/features/orders/pages/AdminOrdersPage';
import { AdminPaymentsPage } from '@/features/payments/pages/AdminPaymentsPage';
import { AdminLogsPage } from '@/features/logging/pages/AdminLogsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* User (protected) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/tickets" element={<TicketListPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/orders" element={<OrderListPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/payments" element={<PaymentListPage />} />
                <Route path="/my-tickets" element={<MyTicketsPage />} />
              </Route>
            </Route>

            {/* Admin (protected + admin) */}
            <Route element={<ProtectedRoute requiresAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminOverviewPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/roles" element={<AdminRolesPage />} />
                <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
                <Route path="/admin/tickets" element={<AdminTicketsPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}