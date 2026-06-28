import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import { createPresetId } from '../utils/createPresetId'
import type {
  AddCustomPresetInput,
  TimerCustomPreset,
  TimerStoreActions,
  TimerStoreState,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

const COPY_SUFFIX = ' (Copy)'

function ensureCopySuffix(label: string): string {
  if (label.endsWith(COPY_SUFFIX)) return label
  return `${label}${COPY_SUFFIX}`
}

/**
 * Creates a new custom preset from a source-shaped input. The label is
 * suffixed with " (Copy)" if not already present, the new preset is never
 * pinned, and a fresh id + timestamps are generated.
 */
export function duplicatePresetAction(
  get: Getter,
  set: Setter,
  source: AddCustomPresetInput,
): string {
  const now = Date.now()
  const preset: TimerCustomPreset = {
    id: createPresetId(),
    label: ensureCopySuffix(source.label),
    mode: source.mode,
    durationSec: source.durationSec,
    breakSec: source.breakSec,
    iconKey: source.iconKey,
    tagline: source.tagline,
    description: source.description,
    bestFor: source.bestFor,
    themeId: source.themeId,
    soundProfileId: source.soundProfileId,
    autoStartBreak: source.autoStartBreak,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  }
  const state = get()
  set({ customPresets: [...state.customPresets, preset] })
  schedulePersist(get)
  return preset.id
}
