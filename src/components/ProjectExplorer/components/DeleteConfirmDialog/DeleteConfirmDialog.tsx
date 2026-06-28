import { AppLoaderGlyph } from '@/components/AppLoader'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'

import type { DeleteConfirmDialogProps } from './DeleteConfirmDialog.types'
import { useDeleteConfirmDialogData } from './useDeleteConfirmDialogData'

export function DeleteConfirmDialog(props: DeleteConfirmDialogProps): React.JSX.Element {
  const { open, onOpenChange, itemName, isFolder } = props
  const { isPending, handleConfirm } = useDeleteConfirmDialogData(props)

  const itemType = isFolder ? 'folder' : 'file'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemType}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete <strong>{itemName}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending && <AppLoaderGlyph size={16} />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
