import { create } from 'zustand'

import { closeQuitConfirmAction } from './actions/closeQuitConfirm'
import { markConfirmedQuitAction } from './actions/markConfirmedQuit'
import { openQuitConfirmAction } from './actions/openQuitConfirm'
import type { QuitConfirmStore } from './quit-confirm-store.types'
import { defaultQuitConfirmState } from './utils/defaultQuitConfirmState'

export const useQuitConfirmStore = create<QuitConfirmStore>()((set) => ({
  ...defaultQuitConfirmState,
  openQuitConfirm: () => openQuitConfirmAction(set),
  closeQuitConfirm: () => closeQuitConfirmAction(set),
  markConfirmedQuit: () => markConfirmedQuitAction(set),
}))
