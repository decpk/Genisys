export interface ConfirmDialogProps {
  isOpen: boolean
  isLoading: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  variant: 'destructive' | 'default'
  onConfirm: () => void
  onCancel: () => void
}
