import { openUrl } from '@tauri-apps/plugin-opener'

/**
 * Open a URL in the user's default browser via the Tauri opener plugin.
 *
 * Thin wrapper kept in `api/` so components/hooks never call the plugin
 * directly and the behavior is trivially mockable in tests.
 */
export async function openExternalUrl(url: string): Promise<void> {
  await openUrl(url)
}
