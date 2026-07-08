import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from '@/app/router';
import { AppProvider } from '@/app/providers/AppProvider';
import { Spinner } from '@/shared/ui/Spinner/Spinner';

function App() {
  return (
    <AppProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-primary-900">
            <Spinner size="lg" />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1636',
            color: '#E5E6EB',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </AppProvider>
  );
}

export default App;
