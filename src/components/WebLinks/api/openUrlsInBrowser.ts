import tauriApi from '@/tauri-api-bridge'

/**
 * Open every URL in `urls` in `browserAppName` (a macOS `open -a` application
 * name such as "Google Chrome") or the system default browser when omitted.
 * Returns the number of URLs opened; throws on failure.
 */
export async function openUrlsInBrowser(urls: string[], browserAppName?: string): Promise<number> {
  const result = await tauriApi.openUrlsInBrowser(urls, browserAppName)
  if (result.success) return result.opened
  throw new Error(result.error || 'Failed to open URLs.')
}
