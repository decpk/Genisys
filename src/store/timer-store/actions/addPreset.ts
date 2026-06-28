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

export function addPresetAction(
  get: Getter,
  set: Setter,
  input: AddCustomPresetInput,
): string {
  const now = Date.now()
  const preset: TimerCustomPreset = {
    id: createPresetId(),
    label: input.label,
    mode: input.mode,
    durationSec: input.durationSec,
    breakSec: input.breakSec,
    iconKey: input.iconKey,
    tagline: input.tagline,
    description: input.description,
    bestFor: input.bestFor,
    themeId: input.themeId,
    soundProfileId: input.soundProfileId,
    autoStartBreak: input.autoStartBreak,
    pinned: input.pinned ?? false,
    createdAt: now,
    updatedAt: now,
  }
  const state = get()
  set({ customPresets: [...state.customPresets, preset] })
  schedulePersist(get)
  return preset.id
}
