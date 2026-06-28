import { invoke } from '@tauri-apps/api/core'

import type { Theme } from '@/themes/themes.types'

/** Persists a custom theme as `<id>.json` in the app data dir. */
export async function saveCustomTheme(theme: Theme): Promise<void> {
  await invoke('cmd_save_custom_theme', { theme })
}
