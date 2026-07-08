import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Lazy-loaded pages
const AuthLayout = lazy(() => import('@/pages/auth/AuthLayout'));
const SignInPage = lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
const TwoFactorPage = lazy(() => import('@/pages/auth/TwoFactorPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AppLayout = lazy(() => import('@/pages/dashboard/AppLayout'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const TradePage = lazy(() => import('@/pages/trade/TradePage'));
const WalletPage = lazy(() => import('@/pages/wallet/WalletPage'));
const AssetDetailPage = lazy(() => import('@/pages/wallet/AssetDetailPage'));
const SignalsPage = lazy(() => import('@/pages/signals/SignalsPage'));
const SignalDetailPage = lazy(() => import('@/pages/signals/SignalDetailPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const KYCWizardPage = lazy(() => import('@/pages/kyc/KYCWizardPage'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="sign-in" replace /> },
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'sign-up', element: <SignUpPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: '2fa', element: <TwoFactorPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'trade/:pair?', element: <TradePage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'wallet/:assetId', element: <AssetDetailPage /> },
          { path: 'signals', element: <SignalsPage /> },
          { path: 'signals/:signalId', element: <SignalDetailPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'kyc', element: <KYCWizardPage /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
