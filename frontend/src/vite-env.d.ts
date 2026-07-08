/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_SENTRY: string;
  readonly VITE_PWA_ENABLED: string;
  readonly VITE_TV_LIBRARY_PATH: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
