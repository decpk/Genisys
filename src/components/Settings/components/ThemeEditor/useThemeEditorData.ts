import { useCallback, useMemo, useState } from 'react'

import { useThemeCatalogStore } from '@/store/theme-catalog-store'
import type { Theme, ThemeColors } from '@/themes/themes.types'

import type {
  ThemeEditorDraft,
  ThemeEditorProps,
  ThemeEditorValidation,
} from './ThemeEditor.types'
import { themeToDraft } from './utils/themeToDraft'
import { draftToTheme } from './utils/draftToTheme'
import { validateDraft } from './utils/validateDraft'

export interface UseThemeEditorData {
  draft: ThemeEditorDraft
  validation: ThemeEditorValidation
  isSaving: boolean
  saveError: string | null
  handleChangeName: (next: string) => void
  handleToggleDark: (next: boolean) => void
  handleChangeColor: (key: keyof ThemeColors, next: string | undefined) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
}

export function useThemeEditorData(props: ThemeEditorProps): UseThemeEditorData {
  const { initialTheme, onSaved, onCancel } = props
  const upsert = useThemeCatalogStore((s) => s.upsert)

  const [draft, setDraft] = useState<ThemeEditorDraft>(() => themeToDraft(initialTheme))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const validation = useMemo(() => validateDraft(draft), [draft])

  const handleChangeName = useCallback((next: string) => {
    setDraft((prev) => ({ ...prev, name: next }))
  }, [])

  const handleToggleDark = useCallback((next: boolean) => {
    setDraft((prev) => ({ ...prev, isDark: next }))
  }, [])

  const handleChangeColor = useCallback(
    (key: keyof ThemeColors, next: string | undefined) => {
      setDraft((prev) => {
        const nextColors = { ...prev.colors }
        if (next === undefined) {
          delete (nextColors as Record<string, string | undefined>)[key as string]
        } else {
          nextColors[key] = next
        }
        return { ...prev, colors: nextColors }
      })
    },
    [],
  )

  const handleSave = useCallback(async () => {
    if (!validation.isValid) return
    setIsSaving(true)
    setSaveError(null)
    try {
      const theme: Theme = draftToTheme(draft)
      await upsert(theme)
      onSaved(theme)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setSaveError(message)
    } finally {
      setIsSaving(false)
    }
  }, [draft, onSaved, upsert, validation.isValid])

  const handleCancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  return {
    draft,
    validation,
    isSaving,
    saveError,
    handleChangeName,
    handleToggleDark,
    handleChangeColor,
    handleSave,
    handleCancel,
  }
}
