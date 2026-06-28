import tauriApi from '@/tauri-api-bridge'

/**
 * Clears all stored usage tracking data. Throws when the backend reports
 * failure.
 */
export async function clearUsageData(): Promise<void> {
  const result = await tauriApi.clearUsageData()
  if (!result?.success) {
    throw new Error(result?.error ?? 'Failed to clear usage data.')
  }
}
