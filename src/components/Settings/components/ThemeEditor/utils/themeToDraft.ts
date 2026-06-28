import type { Theme } from '@/themes/themes.types'

import type { ThemeEditorDraft } from '../ThemeEditor.types'

/** Builds a draft state from an existing theme (no-op clone of colors). */
export function themeToDraft(theme: Theme): ThemeEditorDraft {
  return {
    id: theme.id,
    name: theme.name,
    isDark: theme.isDark,
    colors: { ...theme.colors },
  }
}
