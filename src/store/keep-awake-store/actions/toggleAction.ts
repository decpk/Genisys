import type { StoreApi } from 'zustand'

import { disableAction } from './disableAction'
import { enableAction } from './enableAction'
import type { KeepAwakeStore } from '../types'

/** Flip keep-awake on/off based on the current `isActive` state. */
export async function toggleAction(
  set: StoreApi<KeepAwakeStore>['setState'],
  get: StoreApi<KeepAwakeStore>['getState'],
): Promise<void> {
  if (get().isActive) {
    await disableAction(set, get)
    return
  }
  await enableAction(set)
}
