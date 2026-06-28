import type { TimerSettings } from '@/store/timer-store/timer-store.types'

export interface SettingsPanelHeroProps {
  settings: TimerSettings
  /** Optional callback when the user clicks the theme chip — used to expand the Theme card. */
  onThemeChipClick?: () => void
  /** Optional callback when the user clicks the sound chip — used to expand the Sound card. */
  onSoundChipClick?: () => void
}

export interface SettingsPanelHeroData {
  workMin: number
  shortBreakMin: number
  longBreakMin: number
  sessionsBetweenLongBreak: number
  themeColor: string
  themeLabel: string
  soundLabel: string
}
