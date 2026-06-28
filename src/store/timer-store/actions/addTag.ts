import type { StoreApi } from 'zustand'

import { schedulePersist } from '../timer-store.persistence'
import { createTagId } from '../utils/createTagId'
import type {
  AddTimerTagInput,
  TimerStoreActions,
  TimerStoreState,
  TimerTag,
} from '../timer-store.types'

type Setter = StoreApi<TimerStoreState & TimerStoreActions>['setState']
type Getter = StoreApi<TimerStoreState & TimerStoreActions>['getState']

export function addTagAction(
  get: Getter,
  set: Setter,
  input: AddTimerTagInput,
): string {
  const { name, color } = input
  const state = get()
  const tag: TimerTag = {
    id: createTagId(),
    name,
    color,
    createdAt: Date.now(),
  }
  set({ tags: [...state.tags, tag] })
  schedulePersist(get)
  return tag.id
}
