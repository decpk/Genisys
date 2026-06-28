import { useState } from 'react'

import { THEMES } from '@/themes'
import { useThemeStore } from '@/store/theme-store'

import type { ThemeMode } from './StepTheme.types'
import { getInitialThemeMode } from './utils/getInitialThemeMode'
import { filterThemesByMode } from './utils/filterThemesByMode'

export function useStepThemeData() {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const setTheme = useThemeStore((s) => s.setTheme)

  const [mode, setMode] = useState<ThemeMode>(() => getInitialThemeMode(activeThemeId))

  const themes = filterThemesByMode(THEMES, mode)

  return { activeThemeId, setTheme, mode, setMode, themes }
}
