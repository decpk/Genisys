import { cn } from '@/lib/utils'
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

import type { NewFolderDialogProps } from './NewFolderDialog.types'
import { STYLES } from './NewFolderDialog.styles'
import { useNewFolderDialogData } from './useNewFolderDialogData'

/** Radix dialog for creating a new collection folder (name + accent color). */
export function NewFolderDialog(props: NewFolderDialogProps): React.JSX.Element {
  const { open, onOpenChange, onCreated } = props
  const { name, color, colorPresets, canSubmit, onNameChange, onSelectColor, onSubmit } =
    useNewFolderDialogData(open, onOpenChange, onCreated)

  const swatches = colorPresets.map((preset) => {
    const swatchClass = cn(STYLES.swatch, color === preset && STYLES.swatchActive)
    return (
      <button
        key={preset}
        type="button"
        className={swatchClass}
        style={{ backgroundColor: preset }}
        onClick={() => onSelectColor(preset)}
        aria-label={`Use color ${preset}`}
      />
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>Group your saved previews into a collection.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className={STYLES.form}>
          <div className={STYLES.field}>
            <label className={STYLES.label}>Name</label>
            <Input
              value={name}
              onChange={onNameChange}
              placeholder="e.g. Design inspiration"
              autoFocus
            />
          </div>
          <div className={STYLES.field}>
            <label className={STYLES.label}>Color</label>
            <div className={STYLES.swatchRow}>{swatches}</div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              Create folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
