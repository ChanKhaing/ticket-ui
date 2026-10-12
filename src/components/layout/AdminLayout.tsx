import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-slate-900 p-4 text-white">
        <h2 className="mb-6 text-lg font-bold">⚙️ Admin Panel</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/admin" className="rounded px-3 py-2 hover:bg-slate-800">
            Overview
          </Link>
          <Link to="/admin/users" className="rounded px-3 py-2 hover:bg-slate-800">
            Users
          </Link>
          <Link to="/admin/roles" className="rounded px-3 py-2 hover:bg-slate-800">
            Roles
          </Link>
          <Link to="/admin/permissions" className="rounded px-3 py-2 hover:bg-slate-800">
            Permissions
          </Link>
          <Link to="/admin/tickets" className="rounded px-3 py-2 hover:bg-slate-800">
            Tickets
          </Link>
          <Link to="/admin/orders" className="rounded px-3 py-2 hover:bg-slate-800">
            Orders
          </Link>
          <Link to="/admin/payments" className="rounded px-3 py-2 hover:bg-slate-800">
            Payments
          </Link>
          <Link to="/admin/logs" className="rounded px-3 py-2 hover:bg-slate-800">
            Activity Logs
          </Link>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <span className="text-sm text-muted-foreground">
            {user?.fullName} ({user?.role})
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}