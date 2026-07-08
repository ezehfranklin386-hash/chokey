import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { ErrorState } from '@/shared/ui/ErrorState/ErrorState';

export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Stub: replace with actual role check
  const isAdmin = user?.email?.includes('admin') ?? false;

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-primary-900 p-8">
        <ErrorState
          error="You don't have permission to access this area."
          onSupport={() => window.open('mailto:support@cryptowallet.app')}
        />
      </div>
    );
  }

  return <Outlet />;
}
