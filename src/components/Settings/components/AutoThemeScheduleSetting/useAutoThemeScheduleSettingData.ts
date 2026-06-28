import { useCallback, useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useThemeStore } from '@/store/theme-store'
import { THEMES } from '@/themes'
import type { ThemeScheduleRange } from '@/themes/auto-scheduler/autoThemeScheduler.types'
import { MAX_SCHEDULE_RANGES, validateRanges, generateRangeId } from '@/themes/auto-scheduler'
import { getScheduleStatus } from './utils/getScheduleStatus'

export function useAutoThemeScheduleSettingData() {
  const enabled = useSettingsStore((s) => s.autoThemeEnabled)
  const pauseOnManualChange = useSettingsStore((s) => s.autoThemePauseOnManualChange)
  const ranges = useSettingsStore((s) => s.autoThemeRanges)
  const setEnabled = useSettingsStore((s) => s.setAutoThemeEnabled)
  const setPauseOnManualChange = useSettingsStore((s) => s.setAutoThemePauseOnManualChange)
  const setRanges = useSettingsStore((s) => s.setAutoThemeRanges)
  const activeThemeId = useThemeStore((s) => s.activeThemeId)

  const validationErrors = useMemo(() => validateRanges(ranges), [ranges])

  const canAddRange = ranges.length < MAX_SCHEDULE_RANGES

  const activeTheme = THEMES.find((t) => t.id === activeThemeId)
  const status = useMemo(() => getScheduleStatus(enabled, ranges, activeTheme?.name), [enabled, ranges, activeTheme?.name])

  const errorsForRange = useCallback((rangeId: string, index: number): string[] => {
    const prefix = `Range ${index + 1}`
    return validationErrors.filter((e) => e.startsWith(prefix))
  }, [validationErrors])

  const handleToggleEnabled = useCallback((checked: boolean) => {
    setEnabled(checked)
  }, [setEnabled])

  const handleTogglePauseOnManual = useCallback((checked: boolean) => {
    setPauseOnManualChange(checked)
  }, [setPauseOnManualChange])

  const handleAddRange = useCallback(() => {
    if (!canAddRange) return
    const newRange: ThemeScheduleRange = {
      id: generateRangeId(),
      startTime: '09:00',
      endTime: '17:00',
      themeId: '',
    }
    setRanges([...ranges, newRange])
  }, [canAddRange, ranges, setRanges])

  const handleUpdateRange = useCallback((id: string, field: keyof ThemeScheduleRange, value: string) => {
    const updated = ranges.map((r) => {
      if (r.id !== id) return r
      return { ...r, [field]: value }
    })
    setRanges(updated)
  }, [ranges, setRanges])

  const handleRemoveRange = useCallback((id: string) => {
    setRanges(ranges.filter((r) => r.id !== id))
  }, [ranges, setRanges])

  return {
    enabled,
    pauseOnManualChange,
    ranges,
    canAddRange,
    status,
    validationErrors,
    errorsForRange,
    handleToggleEnabled,
    handleTogglePauseOnManual,
    handleAddRange,
    handleUpdateRange,
    handleRemoveRange,
  }
}
