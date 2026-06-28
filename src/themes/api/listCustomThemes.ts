import { invoke } from '@tauri-apps/api/core'

import type { Theme } from '@/themes/themes.types'

/**
 * Loads every user-defined custom theme from the app data directory.
 * Invalid entries returned by the backend are filtered out client-side.
 */
export async function listCustomThemes(): Promise<Theme[]> {
  const raw = await invoke<unknown[]>('cmd_list_custom_themes')
  if (!Array.isArray(raw)) return []
  return raw.filter(isValidTheme).map((t) => ({ ...t, isCustom: true }))
}

function isValidTheme(value: unknown): value is Theme {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  if (typeof obj.id !== 'string' || obj.id.length === 0) return false
  if (typeof obj.name !== 'string' || obj.name.length === 0) return false
  if (typeof obj.isDark !== 'boolean') return false
  if (!obj.colors || typeof obj.colors !== 'object') return false
  return true
}
