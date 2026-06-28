export interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  isFolder: boolean
  onConfirm: () => Promise<void>
}
