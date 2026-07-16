import axios from 'axios';
import type { ApiErrorResponse } from '@/entities/common/api.types';
import { IS_DEMO_MODE } from './demo/demoConfig';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// ── snake_case ↔ camelCase converters ────────────────────────
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Recursively transform object keys using the given key mapper. */
function mapKeys(value: JsonValue, keyFn: (s: string) => string): JsonValue {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => mapKeys(v, keyFn)) as JsonValue[];
  const result: Record<string, JsonValue> = {};
  for (const [key, val] of Object.entries(value)) {
    result[keyFn(key)] = mapKeys(val, keyFn);
  }
  return result;
}

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

// Request interceptor — attach JWT, convert camelCase → snake_case
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

    // Convert camelCase request body to snake_case for backend
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      try {
        const parsed = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        const converted = mapKeys(parsed as JsonValue, camelToSnake);
        config.data = JSON.stringify(converted);
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }
      } catch {
        // If parsing fails, leave data as-is
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — unwrap JSEND, convert keys, auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap JSEND envelope: {status: "success", data: ...} → data
    let data = response.data;
    if (data && typeof data === 'object' && data.status === 'success' && 'data' in data) {
      data = data.data;
    }
    // Normalize backend snake_case → frontend camelCase
    return mapKeys(data as JsonValue, snakeToCamel);
  },
  async (error) => {
    const originalRequest = error.config;

    // Auto-refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const raw = sessionStorage.getItem('auth_tokens');
        if (raw) {
          const { refreshToken } = JSON.parse(raw);
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
          const newTokens = mapKeys(res.data.data, snakeToCamel);
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
