import type { StoreApi } from 'zustand'

import type { TerminalStore } from '../types'

export function toggleOpenAction(
  set: StoreApi<TerminalStore>['setState'],
  get: StoreApi<TerminalStore>['getState']
): void {
  set({ open: !get().open })
}
