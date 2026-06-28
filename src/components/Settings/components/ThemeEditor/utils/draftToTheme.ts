import type { Theme } from '@/themes/themes.types'

import type { ThemeEditorDraft } from '../ThemeEditor.types'

/** Converts a draft into a persistable Theme value. Always marks the result as `isCustom`. */
export function draftToTheme(draft: ThemeEditorDraft): Theme {
  let category: 'light' | 'dark'
  if (draft.isDark) {
    category = 'dark'
  } else {
    category = 'light'
  }
  return {
    id: draft.id,
    name: draft.name.trim(),
    isDark: draft.isDark,
    isCustom: true,
    category,
    colors: { ...draft.colors },
  }
}
