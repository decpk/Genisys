import { useMemo } from 'react'

import { TIMER_SOUNDS } from '@/components/Timer/constants/timerSounds'
import { TIMER_THEMES } from '@/components/Timer/constants/timerThemes'
import type { TimerSettings } from '@/store/timer-store/timer-store.types'

import type { SettingsPanelHeroData } from './SettingsPanelHero.types'
import { secondsToMinutesLabel } from './utils/secondsToMinutesLabel'

const FALLBACK_THEME_COLOR = '#f59e0b'
const FALLBACK_THEME_LABEL = 'Amber'
const FALLBACK_SOUND_LABEL = 'Bell'

/**
 * Derives the read-only hero summary view-model from raw timer settings.
 * Pure selector — no side effects.
 */
export function useSettingsPanelHeroData(settings: TimerSettings): SettingsPanelHeroData {
  return useMemo(() => {
    const theme = TIMER_THEMES.find((t) => t.id === settings.themeId)
    const sound = TIMER_SOUNDS.find((s) => s.id === settings.soundProfileId)

    let themeColor = FALLBACK_THEME_COLOR
    let themeLabel = FALLBACK_THEME_LABEL
    if (theme) {
      themeColor = theme.ringColor
      themeLabel = theme.label
    }

    let soundLabel = FALLBACK_SOUND_LABEL
    if (sound) soundLabel = sound.label

    return {
      workMin: secondsToMinutesLabel(settings.defaultDurationSec),
      shortBreakMin: secondsToMinutesLabel(settings.shortBreakDurationSec),
      longBreakMin: secondsToMinutesLabel(settings.longBreakDurationSec),
      sessionsBetweenLongBreak: settings.sessionsBetweenLongBreak,
      themeColor,
      themeLabel,
      soundLabel,
    }
  }, [settings])
}
