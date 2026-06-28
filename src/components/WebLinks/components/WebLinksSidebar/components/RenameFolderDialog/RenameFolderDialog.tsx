import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { RenameFolderDialogProps } from './RenameFolderDialog.types'
import { useRenameFolderDialogData } from './useRenameFolderDialogData'

/** Radix dialog for renaming a collection folder. */
export function RenameFolderDialog(props: RenameFolderDialogProps): React.JSX.Element {
  const { folder, open, onOpenChange } = props
  const { name, canSubmit, onNameChange, onSubmit } = useRenameFolderDialogData(
    folder,
    open,
    onOpenChange,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename folder</DialogTitle>
          <DialogDescription>Give this collection a new name.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input value={name} onChange={onNameChange} placeholder="Folder name" autoFocus />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
