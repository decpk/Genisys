import type {
  AddCustomPresetInput,
  TimerMode,
} from '@/store/timer-store/timer-store.types'

import type { PresetEditorFormState } from '../PresetEditorDialog.types'

/** Returns true if a preset with this mode should carry a `breakSec`. */
function shouldIncludeBreakSec(mode: TimerMode): boolean {
  return mode === 'pomodoro'
}

/**
 * Trims a list of best-for bullets, dropping empty entries so the
 * persisted preset doesn't carry blank rows.
 */
function cleanBestFor(items: string[]): string[] {
  return items.map((s) => s.trim()).filter((s) => s.length > 0)
}

/**
 * Constructs the `AddCustomPresetInput` payload from the editor form.
 * Used for both `create` and `duplicate` flows.
 */
export function buildAddPresetInput(
  form: PresetEditorFormState,
): AddCustomPresetInput {
  return {
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
    pinned: false,
  }
}
