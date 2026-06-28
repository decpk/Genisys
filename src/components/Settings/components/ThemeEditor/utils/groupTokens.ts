import { THEME_TOKEN_CATALOG } from '@/themes/themeTokenCatalog'
import type { ThemeTokenGroup, ThemeTokenInfo } from '@/themes/themeTokenCatalog.types'

/** Groups the theme token catalog by their `group` field, preserving original order. */
export function groupTokens(): Record<ThemeTokenGroup, ThemeTokenInfo[]> {
  const result: Record<ThemeTokenGroup, ThemeTokenInfo[]> = {
    surface: [],
    text: [],
    interactive: [],
    feedback: [],
    sidebar: [],
  }
  for (const token of THEME_TOKEN_CATALOG) {
    result[token.group].push(token)
  }
  return result
}
