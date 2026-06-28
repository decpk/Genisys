import { useCallback, useEffect, useMemo } from 'react'
import * as monaco from 'monaco-editor'

import { useThemeStore } from '@/store/theme-store'
import { useSettingsStore } from '@/store/settings-store'
import { useTerminalGitDiffStore } from '@/store/terminal-git-diff-store'
import { THEMES } from '@/themes'
import { defineAppMonacoTheme } from '@/lib/monaco-theme'

import { useTerminalGitDiffContent } from './useTerminalGitDiffContent'

const DIFF_THEME_ID = 'genisys-terminal-diff'

/** Orchestrator hook for the per-pane git diff overlay. */
export function useTerminalDiffOverlayData(leafId: string) {
  const target = useTerminalGitDiffStore((s) => s.target)
  const close = useTerminalGitDiffStore((s) => s.close)
  const content = useTerminalGitDiffContent()
  const load = content.load
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)

  const isOpen = Boolean(target && target.leafId === leafId)
  const appTheme = useMemo(
    () => THEMES.find((t) => t.id === activeThemeId),
    [activeThemeId],
  )

  // Load the diff when this pane's overlay opens / its target changes. `load`
  // is owned by `useTerminalGitDiffContent`, so this effect doesn't trip
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!isOpen || !target) return
    load(target.gitRoot, target.file, target.side)
  }, [isOpen, target, load])

  // Close on Escape while open.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const onEditorMount = useCallback(() => {
    if (!appTheme) return
    defineAppMonacoTheme(DIFF_THEME_ID, appTheme, { includeDiffColors: true })
    monaco.editor.setTheme(DIFF_THEME_ID)
  }, [appTheme])

  return {
    isOpen,
    filePath: target?.file ?? '',
    original: content.original,
    modified: content.modified,
    language: content.language,
    isLoading: content.isLoading,
    error: content.error,
    editorFontSize,
    themeId: DIFF_THEME_ID,
    onEditorMount,
    onClose: close,
  }
}
