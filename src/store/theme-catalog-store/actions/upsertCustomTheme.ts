import { saveCustomTheme } from '@/themes/api'
import type { Theme } from '@/themes/themes.types'

import type { ThemeCatalogGet, ThemeCatalogSet } from '../theme-catalog-store.types'

/** Saves a custom theme to disk and inserts/updates it in the catalog store. */
export async function upsertCustomThemeAction(
  get: ThemeCatalogGet,
  set: ThemeCatalogSet,
  theme: Theme,
): Promise<void> {
  const stamped: Theme = { ...theme, isCustom: true }
  await saveCustomTheme(stamped)

  const current = get().customThemes
  const existingIndex = current.findIndex((t) => t.id === stamped.id)
  let next: Theme[]
  if (existingIndex >= 0) {
    next = current.slice()
    next[existingIndex] = stamped
  } else {
    next = [...current, stamped]
  }
  set({ customThemes: next })
}
