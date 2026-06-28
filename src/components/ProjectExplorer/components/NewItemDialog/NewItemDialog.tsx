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

import type { NewItemDialogProps } from './NewItemDialog.types'
import { useNewItemDialogData } from './useNewItemDialogData'

export function NewItemDialog(props: NewItemDialogProps): React.JSX.Element {
  const { open, onOpenChange, variant } = props
  const { value, isPending, error, isValid, handleChange, handleSubmit } =
    useNewItemDialogData(props)

  const label = variant === 'file' ? 'New File' : 'New Folder'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
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
            placeholder={variant === 'file' ? 'filename.txt' : 'folder-name'}
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
