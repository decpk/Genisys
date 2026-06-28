import tauriApi, { type BrowserApp } from '@/tauri-api-bridge'

/** Fetch the list of installed browsers Genisys can open URLs in. */
export async function listInstalledBrowsers(): Promise<BrowserApp[]> {
  const result = await tauriApi.listBrowsers()
  if (result.success && Array.isArray(result.browsers)) return result.browsers
  return []
}
