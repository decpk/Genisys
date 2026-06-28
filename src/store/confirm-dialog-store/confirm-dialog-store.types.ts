export interface ConfirmDialogOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
  onConfirm: () => Promise<void> | void
  /**
   * Optional third "secondary" action label (e.g. `Don't Save`). When set, the
   * dialog renders a third button to the left of Cancel. When unset, the
   * dialog renders the classic 2-button layout (Cancel + Confirm).
   */
  secondaryActionLabel?: string
  /**
   * Handler invoked when the secondary action is clicked. Must be set whenever
   * `secondaryActionLabel` is set.
   */
  onSecondaryAction?: () => Promise<void> | void
}

export interface ConfirmDialogState {
  isOpen: boolean
  isLoading: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  variant: 'destructive' | 'default'
  onConfirm: (() => Promise<void> | void) | null
  secondaryActionLabel: string | null
  onSecondaryAction: (() => Promise<void> | void) | null
}

export interface ConfirmDialogActions {
  openConfirmDialog: (options: ConfirmDialogOptions) => void
  closeConfirmDialog: () => void
  setLoading: (loading: boolean) => void
}

export type ConfirmDialogStore = ConfirmDialogState & ConfirmDialogActions
