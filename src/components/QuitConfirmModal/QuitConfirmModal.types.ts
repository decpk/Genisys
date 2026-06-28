export interface QuitConfirmModalData {
  isOpen: boolean
  handleConfirm: () => void
  handleCancel: () => void
  handleOpenChange: (open: boolean) => void
}
