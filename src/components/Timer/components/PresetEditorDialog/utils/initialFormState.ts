import { DEFAULT_PRESET_ICON_KEY } from '../../../constants/timerPresetIcons'
import { TIMER_SOUNDS } from '../../../constants/timerSounds'
import { TIMER_THEMES } from '../../../constants/timerThemes'

import type { PresetEditorFormState } from '../PresetEditorDialog.types'

/** Default form values for a brand-new preset. */
export function initialFormState(): PresetEditorFormState {
  return {
    label: '',
    mode: 'pomodoro',
    workSec: 25 * 60,
    breakSec: 5 * 60,
    iconKey: DEFAULT_PRESET_ICON_KEY,
    tagline: '',
    description: '',
    bestFor: [''],
    themeId: TIMER_THEMES[0].id,
    soundProfileId: TIMER_SOUNDS[0].id,
    autoStartBreak: false,
  }
}
