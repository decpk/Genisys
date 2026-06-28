/// <reference types="vite/client" />

import type api from './tauri-api-bridge'

declare global {
  const __APP_VERSION__: string

  interface Window {
    api: typeof api
    electron: { process: { platform: string } }
  }
}
