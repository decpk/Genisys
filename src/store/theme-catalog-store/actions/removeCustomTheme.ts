import { deleteCustomTheme } from '@/themes/api'

import type { ThemeCatalogGet, ThemeCatalogSet } from '../theme-catalog-store.types'

/** Removes a custom theme from disk and from the catalog store. */
export async function removeCustomThemeAction(
  get: ThemeCatalogGet,
  set: ThemeCatalogSet,
  id: string,
): Promise<void> {
  await deleteCustomTheme(id)
  set({ customThemes: get().customThemes.filter((t) => t.id !== id) })
}
