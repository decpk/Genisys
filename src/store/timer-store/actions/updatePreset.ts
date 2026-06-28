import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import type {
  TimerCustomPreset,
  TimerStoreActions,
  TimerStoreState,
  UpdateCustomPresetInput,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function updatePresetAction(
  get: Getter,
  set: Setter,
  input: UpdateCustomPresetInput,
): void {
  const state = get()
  const now = Date.now()
  let touched = false
  const next: TimerCustomPreset[] = state.customPresets.map((p) => {
    if (p.id !== input.id) return p
    touched = true
    return {
      ...p,
      label: input.label ?? p.label,
      mode: input.mode ?? p.mode,
      durationSec: input.durationSec ?? p.durationSec,
      breakSec: input.breakSec === undefined ? p.breakSec : input.breakSec,
      iconKey: input.iconKey ?? p.iconKey,
      tagline: input.tagline ?? p.tagline,
      description: input.description ?? p.description,
      bestFor: input.bestFor ?? p.bestFor,
      themeId: input.themeId === undefined ? p.themeId : input.themeId,
      soundProfileId:
        input.soundProfileId === undefined ? p.soundProfileId : input.soundProfileId,
      autoStartBreak:
        input.autoStartBreak === undefined ? p.autoStartBreak : input.autoStartBreak,
      pinned: input.pinned === undefined ? p.pinned : input.pinned,
      updatedAt: now,
    }
  })
  if (!touched) return
  set({ customPresets: next })
  schedulePersist(get)
}
