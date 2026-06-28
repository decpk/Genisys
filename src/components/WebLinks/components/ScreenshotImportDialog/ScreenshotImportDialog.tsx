import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { ScreenshotImportDialogProps } from './ScreenshotImportDialog.types'
import { STYLES } from './ScreenshotImportDialog.styles'
import { useScreenshotImportDialogData } from './useScreenshotImportDialogData'
import { ScreenshotImportBody } from './components/ScreenshotImportBody'

/** Controlled dialog that scans a screenshot for URLs via the vision backend. */
export function ScreenshotImportDialog(props: ScreenshotImportDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const vm = useScreenshotImportDialogData(open, onOpenChange)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={STYLES.content} onPaste={vm.onPaste}>
        <DialogHeader>
          <DialogTitle>Scan a screenshot for URLs</DialogTitle>
          <DialogDescription>
            Extract links from a screenshot of your open browser tabs.
          </DialogDescription>
        </DialogHeader>
        <ScreenshotImportBody {...vm} />
      </DialogContent>
    </Dialog>
  )
}
