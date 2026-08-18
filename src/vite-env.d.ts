/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_ENABLE_SENTRY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_ENABLE_PWA?: string
  readonly VITE_ENABLE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
