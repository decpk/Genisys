import { useEffect, useCallback, useMemo } from 'react'
import type * as MonacoType from 'monaco-editor'

import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { defineAppMonacoTheme } from '@/lib/monaco-theme'

const THEME_ID = 'mock-dummy-data-preview-theme'

export function useDummyDataPreviewData() {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const appTheme = useMemo(() => THEMES.find((t) => t.id === activeThemeId), [activeThemeId])

  useEffect(() => {
    if (appTheme) defineAppMonacoTheme(THEME_ID, appTheme)
  }, [appTheme])

  const handleBeforeMount = useCallback(
    (m: typeof MonacoType) => {
      if (appTheme) {
        defineAppMonacoTheme(THEME_ID, appTheme)
      } else {
        m.editor.defineTheme(THEME_ID, { base: 'vs-dark', inherit: true, rules: [], colors: {} })
      }
    },
    [appTheme]
  )

  return {
    themeId: THEME_ID,
    editorFontSize,
    handleBeforeMount,
  }
}
