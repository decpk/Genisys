import type {
  TimerMode,
  UpdateCustomPresetInput,
} from '@/store/timer-store/timer-store.types'

import type { PresetEditorFormState } from '../PresetEditorDialog.types'

function shouldIncludeBreakSec(mode: TimerMode): boolean {
  return mode === 'pomodoro'
}

function cleanBestFor(items: string[]): string[] {
  return items.map((s) => s.trim()).filter((s) => s.length > 0)
}

/**
 * Constructs the `UpdateCustomPresetInput` payload from the editor form,
 * targeting an existing custom preset by id.
 */
export function buildUpdatePresetInput(
  id: string,
  form: PresetEditorFormState,
): UpdateCustomPresetInput {
  return {
    id,
    label: form.label.trim(),
    mode: form.mode,
    durationSec: form.workSec,
    breakSec: shouldIncludeBreakSec(form.mode) ? form.breakSec : undefined,
    iconKey: form.iconKey,
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    bestFor: cleanBestFor(form.bestFor),
    themeId: form.themeId,
    soundProfileId: form.soundProfileId,
    autoStartBreak: form.autoStartBreak,
  }
}
