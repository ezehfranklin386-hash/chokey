import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { ErrorState } from '@/shared/ui/ErrorState/ErrorState';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-primary-900 p-8">
      <div className="text-center space-y-4">
        <ErrorState
          error="Page not found"
          onRetry={() => window.location.href = '/app/dashboard'}
        />
        <Link to="/app/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
