export type NewItemVariant = 'file' | 'folder'

export interface NewItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: NewItemVariant
  onConfirm: (name: string) => Promise<void>
}
