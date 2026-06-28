import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AppLoaderGlyph } from '@/components/AppLoader'

import type { RenameWebpageDialogProps } from './RenameWebpageDialog.types'
import { STYLES } from './RenameWebpageDialog.styles'
import { useRenameWebpageDialogData } from './useRenameWebpageDialogData'

export function RenameWebpageDialog(
  props: RenameWebpageDialogProps,
): React.JSX.Element {
  const { webpage, open, onOpenChange } = props
  const { name, setName, isSaving, handleSave } = useRenameWebpageDialogData(
    webpage,
    onOpenChange,
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleSave()
    }
  }

  const handleCancel = (): void => {
    onOpenChange(false)
  }

  const isSaveDisabled = isSaving || name.trim().length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={STYLES.content}>
        <DialogHeader>
          <DialogTitle>Rename page</DialogTitle>
          <DialogDescription>
            Update the display name for this saved page.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Page name"
          autoFocus
        />

        <DialogFooter className={STYLES.footer}>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            {isSaving && <AppLoaderGlyph size={12} />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
