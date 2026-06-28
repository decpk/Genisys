import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { DummyDataDialogBody } from './DummyDataDialogBody'
import { dummyDataDialogStyles as styles } from './DummyDataDialog.styles'
import type { DummyDataDialogProps } from './DummyDataDialog.types'

export function DummyDataDialog(props: DummyDataDialogProps) {
  const { open, onOpenChange, onApply } = props

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle>Add dummy data</DialogTitle>
          <DialogDescription>
            Pick a category to generate a sample JSON response body.
          </DialogDescription>
        </DialogHeader>

        {open && <DummyDataDialogBody onOpenChange={onOpenChange} onApply={onApply} />}
      </DialogContent>
    </Dialog>
  )
}
