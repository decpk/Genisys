import type { PresetEditorFormState } from '../PresetEditorDialog.types'

/**
 * Validates the editor form. Returns an error message (the first failure
 * encountered) or `null` when the form is acceptable.
 */
export function validateForm(form: PresetEditorFormState): string | null {
  if (form.label.trim().length === 0) return 'Label is required.'
  if (form.mode !== 'stopwatch' && form.workSec <= 0) {
    return 'Duration must be greater than zero.'
  }
  return null
}
