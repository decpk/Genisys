import { useEffect, useCallback, useMemo, useState } from 'react'
import type * as MonacoType from 'monaco-editor'

import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { THEMES } from '@/themes'
import { defineAppMonacoTheme } from '@/lib/monaco-theme'

const THEME_ID = 'mock-static-response-theme'

export function useStaticResponseTabData(onChange: (value: string) => void) {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const appTheme = useMemo(() => THEMES.find((t) => t.id === activeThemeId), [activeThemeId])

  const [isDummyDialogOpen, setIsDummyDialogOpen] = useState(false)

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

  const handleEditorChange = useCallback(
    (next: string | undefined) => onChange(next ?? ''),
    [onChange]
  )

  const openDummyDialog = useCallback(() => setIsDummyDialogOpen(true), [])

  const handleApplyDummyData = useCallback(
    (json: string) => onChange(json),
    [onChange]
  )

  return {
    themeId: THEME_ID,
    editorFontSize,
    handleBeforeMount,
    handleEditorChange,
    isDummyDialogOpen,
    setIsDummyDialogOpen,
    openDummyDialog,
    handleApplyDummyData,
  }
}
