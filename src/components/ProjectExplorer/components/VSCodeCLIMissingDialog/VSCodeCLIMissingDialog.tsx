import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { InstructionsBlock } from './InstructionsBlock'
import type { VSCodeCLIMissingDialogProps } from './VSCodeCLIMissingDialog.types'
import { useVSCodeCLIMissingDialogData } from './useVSCodeCLIMissingDialogData'

export function VSCodeCLIMissingDialog(props: VSCodeCLIMissingDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const { handleRetry } = useVSCodeCLIMissingDialogData(props)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>VS Code CLI not found</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          The <code className="text-foreground">code</code> command is not
          available in your PATH. Follow the instructions below to set it up:
        </p>
        <InstructionsBlock />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleRetry}>Retry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
