import { TIMER_SOUNDS } from '../../../constants/timerSounds'
import { TIMER_THEMES } from '../../../constants/timerThemes'

import type {
  PresetEditorFormState,
  PresetEditorSource,
} from '../PresetEditorDialog.types'

/**
 * Maps a normalized `PresetEditorSource` (built-in or custom) into the
 * editor form. Empty `bestFor` is normalized to `['']` so the input list
 * always has at least one row.
 */
export function formStateFromSource(
  source: PresetEditorSource,
): PresetEditorFormState {
  const bestFor = source.bestFor.length > 0 ? source.bestFor.slice() : ['']
  return {
    label: source.label,
    mode: source.mode,
    workSec: source.durationSec,
    breakSec: source.breakSec ?? 5 * 60,
    iconKey: source.iconKey,
    tagline: source.tagline,
    description: source.description,
    bestFor,
    themeId: source.themeId ?? TIMER_THEMES[0].id,
    soundProfileId: source.soundProfileId ?? TIMER_SOUNDS[0].id,
    autoStartBreak: source.autoStartBreak ?? false,
  }
}
