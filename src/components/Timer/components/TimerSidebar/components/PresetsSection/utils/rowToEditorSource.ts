import { useTimerStore } from '@/store/timer-store'

import type { PresetEditorSource } from '../../../../PresetEditorDialog/PresetEditorDialog.types'
import type { PresetRow } from '../../../../../hooks/useAllPresets.types'

import { TIMER_PRESETS } from '../../../../../constants/timerPresets'

/**
 * Builds a fully-populated `PresetEditorSource` for a row. Built-in
 * sources include their canonical `iconKey`; custom sources include all
 * persisted fields including the `customId` needed for edit mode.
 */
export function rowToEditorSource(row: PresetRow): PresetEditorSource {
  if (!row.isCustom) {
    const builtIn = TIMER_PRESETS.find((p) => p.id === row.preset.id)
    return {
      label: row.preset.label,
      mode: row.preset.mode,
      durationSec: row.preset.durationSec,
      breakSec: row.preset.breakSec,
      iconKey: row.preset.iconKey,
      tagline: row.preset.tagline,
      description: row.preset.description,
      bestFor: builtIn?.bestFor ?? row.preset.bestFor,
    }
  }
  const custom = useTimerStore
    .getState()
    .customPresets.find((p) => p.id === row.preset.id)
  return {
    label: row.preset.label,
    mode: row.preset.mode,
    durationSec: row.preset.durationSec,
    breakSec: row.preset.breakSec,
    iconKey: row.preset.iconKey,
    tagline: row.preset.tagline,
    description: row.preset.description,
    bestFor: row.preset.bestFor,
    themeId: custom?.themeId,
    soundProfileId: custom?.soundProfileId,
    autoStartBreak: custom?.autoStartBreak,
    customId: row.preset.id,
  }
}
