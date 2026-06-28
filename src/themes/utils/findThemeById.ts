import { useThemeCatalogStore } from '@/store/theme-catalog-store'
import { THEMES } from '@/themes/themes.constants'
import type { Theme } from '@/themes/themes.types'

/**
 * Looks up a theme by id from both predefined `THEMES` and any loaded custom themes.
 * Returns `undefined` when the id is unknown in both sets.
 */
export function findThemeById(themeId: string): Theme | undefined {
  const predefined = THEMES.find((t) => t.id === themeId)
  if (predefined) return predefined
  return useThemeCatalogStore.getState().customThemes.find((t) => t.id === themeId)
}
