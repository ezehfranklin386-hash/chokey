import axios from 'axios';
import type { ApiErrorResponse } from '@/entities/common/api.types';
import { IS_DEMO_MODE } from './demo/demoConfig';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Demo Mode Adapter ───────────────────────────────────────
// When VITE_DEMO_MODE=true, replace the real HTTP adapter with
// an in-memory mock so the app runs without a backend.
// Vite statically replaces import.meta.env so this branch is
// tree-shaken entirely in production builds.
if (IS_DEMO_MODE) {
  import('./demo/demoInterceptor').then(({ demoAdapter }) => {
    apiClient.defaults.adapter = demoAdapter as any;
  });
}

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    try {
      const raw = sessionStorage.getItem('auth_tokens');
      if (raw) {
        const { accessToken } = JSON.parse(raw);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — unwrap JSEND, auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Auto-refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const raw = sessionStorage.getItem('auth_tokens');
        if (raw) {
          const { refreshToken } = JSON.parse(raw);
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const newTokens = res.data.data;
          sessionStorage.setItem('auth_tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — force logout
        sessionStorage.removeItem('auth_tokens');
        window.location.href = '/auth/sign-in';
      }
    }

    const apiError = error.response?.data as ApiErrorResponse | undefined;
    return Promise.reject({
      code: apiError?.error?.code ?? 'UNKNOWN_ERROR',
      message: apiError?.error?.message ?? error.message ?? 'Network error',
      details: apiError?.error?.details,
      status: error.response?.status,
    });
  },
);
