/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CHRONOS_API_URL: string
  readonly CHRONOS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
