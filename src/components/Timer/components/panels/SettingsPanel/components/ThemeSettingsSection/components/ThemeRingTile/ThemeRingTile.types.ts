import type { TimerTheme } from '@/components/Timer/constants/timerThemes'

export interface ThemeRingTileProps {
  theme: TimerTheme
  isActive: boolean
  onSelect: (themeId: string) => void
}
