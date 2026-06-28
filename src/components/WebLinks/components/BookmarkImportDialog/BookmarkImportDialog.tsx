import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { BookmarkImportDialogProps } from './BookmarkImportDialog.types'
import { STYLES } from './BookmarkImportDialog.styles'
import { useBookmarkImportDialogData } from './useBookmarkImportDialogData'
import { BookmarkImportBody } from './components/BookmarkImportBody'

/** Controlled dialog that imports browser bookmarks into the collection. */
export function BookmarkImportDialog(props: BookmarkImportDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const vm = useBookmarkImportDialogData(open, onOpenChange)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={STYLES.content}>
        <DialogHeader>
          <DialogTitle>Import bookmarks</DialogTitle>
          <DialogDescription>
            Bring your browser bookmarks into your collection.
          </DialogDescription>
        </DialogHeader>
        <BookmarkImportBody {...vm} />
      </DialogContent>
    </Dialog>
  )
}
