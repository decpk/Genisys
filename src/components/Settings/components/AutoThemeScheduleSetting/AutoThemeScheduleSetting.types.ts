import type { ThemeScheduleRange } from '@/themes/auto-scheduler/autoThemeScheduler.types'

export interface AutoThemeScheduleSettingProps {}

export interface ThemeScheduleRangeRowProps {
  range: ThemeScheduleRange
  index: number
  errors: string[]
  onUpdate: (id: string, field: keyof ThemeScheduleRange, value: string) => void
  onRemove: (id: string) => void
}
