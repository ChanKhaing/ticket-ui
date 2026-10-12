import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';

export function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4">
        <h2 className="mb-6 text-lg font-bold">🎟️ Ticket Platform</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/dashboard" className="rounded px-3 py-2 hover:bg-accent">
            Dashboard
          </Link>
          <Link to="/tickets" className="rounded px-3 py-2 hover:bg-accent">
            Browse Tickets
          </Link>
          <Link to="/orders" className="rounded px-3 py-2 hover:bg-accent">
            My Orders
          </Link>
          <Link to="/payments" className="rounded px-3 py-2 hover:bg-accent">
            My Payments
          </Link>
          <Link to="/my-tickets" className="rounded px-3 py-2 hover:bg-accent">
            My Tickets
          </Link>
          <Link to="/profile" className="rounded px-3 py-2 hover:bg-accent">
            Profile
          </Link>
        </nav>
      </aside>

      {/* Main */}
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