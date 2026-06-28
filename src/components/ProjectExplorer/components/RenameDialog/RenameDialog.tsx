import { AppLoaderGlyph } from '@/components/AppLoader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import type { RenameDialogProps } from './RenameDialog.types'
import { useRenameDialogData } from './useRenameDialogData'

export function RenameDialog(props: RenameDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const { value, isPending, error, isValid, handleChange, handleSubmit } =
    useRenameDialogData(props)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            autoFocus
            disabled={isPending}
            aria-invalid={!!error}
          />
          {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending && <AppLoaderGlyph size={16} />}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
