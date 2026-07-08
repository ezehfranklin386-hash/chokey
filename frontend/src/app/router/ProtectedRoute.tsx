import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-primary-900">
        <div className="w-80 space-y-4">
          <Skeleton variant="card" />
          <Skeleton lines={3} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
