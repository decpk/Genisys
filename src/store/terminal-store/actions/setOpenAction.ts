import type { StoreApi } from 'zustand'

import type { TerminalStore } from '../types'

export function setOpenAction(
  set: StoreApi<TerminalStore>['setState'],
  _get: StoreApi<TerminalStore>['getState'],
  open: boolean
): void {
  set({ open })
}
