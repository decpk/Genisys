import { useEffect, useMemo, useCallback } from 'react'
import type * as monaco from 'monaco-editor'

import { useThemeStore } from '@/store/theme-store'
import { THEMES } from '@/themes'
import { defineAppMonacoTheme } from '@/lib/monaco-theme'

const EDITOR_THEME_ID = 'genisys-md-editor-preview'

export function useEditorTheme(
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
) {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const appTheme = useMemo(() => THEMES.find((t) => t.id === activeThemeId), [activeThemeId])

  useEffect(() => {
    if (!appTheme) return
    defineAppMonacoTheme(EDITOR_THEME_ID, appTheme)
  }, [appTheme])

  const handleEditorMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor
      if (appTheme) {
        defineAppMonacoTheme(EDITOR_THEME_ID, appTheme)
      }
    },
    [editorRef, appTheme],
  )

  return { handleEditorMount, themeId: EDITOR_THEME_ID }
}
