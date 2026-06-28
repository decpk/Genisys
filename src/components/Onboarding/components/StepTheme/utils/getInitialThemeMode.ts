import { findThemeById } from '@/themes'

import type { ThemeMode } from '../StepTheme.types'

export function getInitialThemeMode(activeThemeId: string): ThemeMode {
  const theme = findThemeById(activeThemeId)
  if (theme && !theme.isDark) return 'light'
  return 'dark'
}
