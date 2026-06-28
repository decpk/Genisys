import { useMemo } from 'react'

import { useTimerStore } from '@/store/timer-store'

import { TIMER_PRESETS } from '../constants/timerPresets'
import { customPresetToTimerPreset } from '../utils/customPresetToTimerPreset'

import type { PresetGroups, PresetRow } from './useAllPresets.types'

/**
 * Returns presets grouped into Pinned / Built-in / Your Presets, applying
 * the user's pin state. Pinned built-ins are removed from the Built-in
 * group; pinned customs are removed from the Your-Presets group.
 */
export function useAllPresets(): PresetGroups {
  const customPresets = useTimerStore((s) => s.customPresets)
  const pinnedBuiltInIds = useTimerStore((s) => s.pinnedBuiltInIds)

  return useMemo<PresetGroups>(() => {
    const pinnedSet = new Set(pinnedBuiltInIds)

    const builtInRows: PresetRow[] = TIMER_PRESETS.map((p) => ({
      preset: p,
      isCustom: false,
      isPinned: pinnedSet.has(p.id),
    }))
    const customRows: PresetRow[] = customPresets.map((c) => ({
      preset: customPresetToTimerPreset(c),
      isCustom: true,
      isPinned: c.pinned,
    }))

    const pinned: PresetRow[] = [
      ...builtInRows.filter((r) => r.isPinned),
      ...customRows.filter((r) => r.isPinned),
    ]
    const builtIn: PresetRow[] = builtInRows.filter((r) => !r.isPinned)
    const custom: PresetRow[] = customRows.filter((r) => !r.isPinned)

    return { pinned, builtIn, custom }
  }, [customPresets, pinnedBuiltInIds])
}
