import type { Theme } from '@/themes'

import type { ThemeMode } from '../StepTheme.types'

export function filterThemesByMode(themes: readonly Theme[], mode: ThemeMode): Theme[] {
  if (mode === 'light') return themes.filter((theme) => !theme.isDark)
  return themes.filter((theme) => theme.isDark)
}
