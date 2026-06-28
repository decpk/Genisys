import { THEME_TOKEN_CATALOG } from '@/themes/themeTokenCatalog'

import type { ThemeEditorDraft, ThemeEditorValidation } from '../ThemeEditor.types'

/** Validates a draft. Returns the first nameError + an overall isValid flag. */
export function validateDraft(draft: ThemeEditorDraft): ThemeEditorValidation {
  let nameError: string | null = null
  if (draft.name.trim().length === 0) {
    nameError = 'Theme name is required.'
  } else if (draft.name.trim().length > 60) {
    nameError = 'Theme name must be 60 characters or fewer.'
  }

  // Required tokens must be non-empty strings; optional sidebar tokens may be undefined.
  let allRequiredPresent = true
  for (const token of THEME_TOKEN_CATALOG) {
    if (token.optional) continue
    const value = draft.colors[token.key]
    if (typeof value !== 'string' || value.trim().length === 0) {
      allRequiredPresent = false
      break
    }
  }

  const isValid = nameError === null && allRequiredPresent
  return { nameError, isValid }
}
