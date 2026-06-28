export interface QuitConfirmState {
  isOpen: boolean
  confirmedQuit: boolean
}

export interface QuitConfirmActions {
  openQuitConfirm: () => void
  closeQuitConfirm: () => void
  markConfirmedQuit: () => void
}

export type QuitConfirmStore = QuitConfirmState & QuitConfirmActions

export type QuitConfirmSet = (
  partial:
    | Partial<QuitConfirmStore>
    | ((state: QuitConfirmStore) => Partial<QuitConfirmStore>)
) => void
