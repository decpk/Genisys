import { useCallback, useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import type { DndScheduleRange } from '@/frameworks/notification/dnd'
import {
  MAX_DND_RANGES,
  generateDndRangeId,
} from '@/frameworks/notification/dnd'
import { getDndStatus } from './utils/getDndStatus'

/**
 * Orchestrator hook for `DndScheduleSetting`. Owns:
 *  - selectors into the settings store (`dndEnabled`, `dndRanges`)
 *  - derived state (`canAddRange`, `status`)
 *  - mutation callbacks for the master toggle and individual ranges
 *
 * Pure read/write against the store — no side effects, no fetches.
 */
export function useDndScheduleSettingData() {
  const enabled = useSettingsStore((s) => s.dndEnabled)
  const ranges = useSettingsStore((s) => s.dndRanges)
  const setEnabled = useSettingsStore((s) => s.setDndEnabled)
  const setRanges = useSettingsStore((s) => s.setDndRanges)

  const canAddRange = ranges.length < MAX_DND_RANGES

  const status = useMemo(() => getDndStatus(enabled, ranges), [enabled, ranges])

  const handleToggleEnabled = useCallback(
    (checked: boolean) => {
      setEnabled(checked)
    },
    [setEnabled]
  )

  const handleAddRange = useCallback(() => {
    if (!canAddRange) return
    const newRange: DndScheduleRange = {
      id: generateDndRangeId(),
      startTime: '22:00',
      endTime: '08:00',
    }
    setRanges([...ranges, newRange])
  }, [canAddRange, ranges, setRanges])

  const handleUpdateRange = useCallback(
    (id: string, field: 'startTime' | 'endTime', value: string) => {
      const updated = ranges.map((r) => {
        if (r.id !== id) return r
        return { ...r, [field]: value }
      })
      setRanges(updated)
    },
    [ranges, setRanges]
  )

  const handleRemoveRange = useCallback(
    (id: string) => {
      setRanges(ranges.filter((r) => r.id !== id))
    },
    [ranges, setRanges]
  )

  return {
    enabled,
    ranges,
    canAddRange,
    status,
    handleToggleEnabled,
    handleAddRange,
    handleUpdateRange,
    handleRemoveRange,
  }
}
