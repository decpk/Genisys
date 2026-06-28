import type { ConfirmDialogState } from '../confirm-dialog-store.types'

export const defaultConfirmDialogState: ConfirmDialogState = {
  isOpen: false,
  isLoading: false,
  title: '',
  description: '',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  variant: 'destructive',
  onConfirm: null,
  secondaryActionLabel: null,
  onSecondaryAction: null,
}
