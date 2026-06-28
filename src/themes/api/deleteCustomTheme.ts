import { invoke } from '@tauri-apps/api/core'

/** Removes a custom theme JSON file. Idempotent on the backend. */
export async function deleteCustomTheme(id: string): Promise<void> {
  await invoke('cmd_delete_custom_theme', { id })
}
