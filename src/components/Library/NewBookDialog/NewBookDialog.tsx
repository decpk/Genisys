import { Dialog, DialogContent } from '@/components/ui/dialog'

import { useNewBookDialogData } from './hooks/useNewBookDialogData'
import type { NewBookDialogProps } from './NewBookDialog.types'
import { NewBookDialogAIMode } from './components/NewBookDialogAIMode'
import { NewBookDialogLocalMode } from './components/NewBookDialogLocalMode'
import { NewBookDialogRawMode } from './components/NewBookDialogRawMode'

const DIALOG_CLASS =
  '!p-0 !gap-0 flex flex-col overflow-hidden !w-[95vw] !h-[95vh] !max-w-none !max-h-none'

export function NewBookDialog(props: NewBookDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const data = useNewBookDialogData(onOpenChange)
  const handleCancel = (): void => onOpenChange(false)

  let body: React.JSX.Element
  if (data.mode === 'raw-md') {
    body = <NewBookDialogRawMode data={data} onCancel={handleCancel} />
  } else if (data.mode === 'local-md') {
    body = <NewBookDialogLocalMode data={data} onCancel={handleCancel} />
  } else {
    body = <NewBookDialogAIMode data={data} onCancel={handleCancel} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className={DIALOG_CLASS}
      >
        {body}
      </DialogContent>
    </Dialog>
  )
}
