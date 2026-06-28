import { useCallback, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useThemeCatalogStore } from '@/store/theme-catalog-store'
import { useThemeStore } from '@/store/theme-store'
import { createCustomTheme } from '@/themes/utils/createCustomTheme'
import { findThemeById } from '@/themes/utils/findThemeById'
import type { Theme } from '@/themes/themes.types'

import type { ThemeEditorMode } from '../components/ThemeEditor'

export interface UseThemeSectionData {
  customThemes: ReadonlyArray<Theme>
  activeThemeId: string
  editorMode: ThemeEditorMode | null
  editorSeed: Theme | null
  editorKey: string
  handleCreate: () => void
  handleEdit: (theme: Theme) => void
  handleDuplicate: (theme: Theme) => void
  handleDelete: (theme: Theme) => void
  handleApply: (theme: Theme) => void
  handleEditorSaved: (theme: Theme) => void
  handleEditorCancel: () => void
}

export function useThemeSectionData(): UseThemeSectionData {
  const customThemes = useThemeCatalogStore(useShallow((s) => s.customThemes))
  const upsert = useThemeCatalogStore((s) => s.upsert)
  const remove = useThemeCatalogStore((s) => s.remove)
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [editorMode, setEditorMode] = useState<ThemeEditorMode | null>(null)
  const [editorSeed, setEditorSeed] = useState<Theme | null>(null)

  const editorKey = editorSeed?.id ?? 'closed'

  const handleCreate = useCallback(() => {
    const base = findThemeById(activeThemeId)
    if (!base) return
    const seed = createCustomTheme(base, 'Untitled custom theme')
    setEditorSeed(seed)
    setEditorMode('create')
  }, [activeThemeId])

  const handleEdit = useCallback((theme: Theme) => {
    setEditorSeed(theme)
    setEditorMode('edit')
  }, [])

  const handleDuplicate = useCallback(
    async (theme: Theme) => {
      const copy = createCustomTheme(theme, `${theme.name} Copy`)
      await upsert(copy)
      setEditorSeed(copy)
      setEditorMode('edit')
    },
    [upsert],
  )

  const handleDelete = useCallback(
    (theme: Theme) => {
      openConfirmDialog({
        title: 'Delete custom theme?',
        description: `"${theme.name}" will be permanently removed from your custom themes. This cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'destructive',
        onConfirm: async () => {
          await remove(theme.id)
        },
      })
    },
    [openConfirmDialog, remove],
  )

  const handleApply = useCallback(
    (theme: Theme) => {
      setTheme(theme.id)
    },
    [setTheme],
  )

  const handleEditorSaved = useCallback(
    (theme: Theme) => {
      setTheme(theme.id)
      setEditorMode(null)
      setEditorSeed(null)
    },
    [setTheme],
  )

  const handleEditorCancel = useCallback(() => {
    setEditorMode(null)
    setEditorSeed(null)
  }, [])

  return {
    customThemes,
    activeThemeId,
    editorMode,
    editorSeed,
    editorKey,
    handleCreate,
    handleEdit,
    handleDuplicate,
    handleDelete,
    handleApply,
    handleEditorSaved,
    handleEditorCancel,
  }
}
