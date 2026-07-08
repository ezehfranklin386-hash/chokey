import toast from 'react-hot-toast';

export interface ToastOptions {
  message: string;
  duration?: number;
}

type ToastArg = string | ToastOptions;

function resolveToastOptions(arg: ToastArg): ToastOptions {
  return typeof arg === 'string' ? { message: arg } : arg;
}

export function showSuccessToast(arg: ToastArg) {
  const { message, duration = 4000 } = resolveToastOptions(arg);
  return toast.success(message, { duration });
}

export function showErrorToast(arg: ToastArg) {
  const { message, duration = 5000 } = resolveToastOptions(arg);
  return toast.error(message, { duration });
}

export function showInfoToast(arg: ToastArg) {
  const { message, duration = 4000 } = resolveToastOptions(arg);
  return toast(message, {
    duration,
    icon: 'ℹ️',
    style: { borderLeft: '3px solid #60A5FA' },
  });
}

export function showLoadingToast(arg: ToastArg) {
  const { message } = resolveToastOptions(arg);
  return toast.loading(message);
}

// Default toast styling (applied via Toaster component in App.tsx)
export const defaultToastOptions = {
  style: {
    background: '#0F1636',
    color: '#E5E6EB',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '14px',
  },
  success: {
    iconTheme: { primary: '#22C55E', secondary: '#fff' },
    style: { borderLeft: '3px solid #22C55E' },
  },
  error: {
    iconTheme: { primary: '#EF4444', secondary: '#fff' },
    style: { borderLeft: '3px solid #EF4444' },
  },
};
