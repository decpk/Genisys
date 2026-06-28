import { Link2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppInlineLoader } from '@/components/AppLoader'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { AddLinkDialogProps } from './AddLinkDialog.types'
import { STYLES } from './AddLinkDialog.styles'
import { useAddLinkDialogData } from './useAddLinkDialogData'

/** Radix dialog for quick-adding a URL: fetches its link metadata and saves it. */
export function AddLinkDialog(props: AddLinkDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const { inputValue, isAdding, canSubmit, onInputChange, onSubmit } = useAddLinkDialogData(
    open,
    onOpenChange,
  )

  const submitContent = isAdding ? <AppInlineLoader size={16} /> : 'Add link'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a link</DialogTitle>
          <DialogDescription>
            Paste a URL to save it as a rich link with metadata.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className={STYLES.form}>
          <div className={STYLES.field}>
            <label className={STYLES.label}>URL</label>
            <div className={STYLES.inputWrapper}>
              <Link2 size={16} className={STYLES.inputIcon} />
              <Input
                value={inputValue}
                onChange={onInputChange}
                placeholder="Paste a link to save…"
                type="text"
                inputMode="url"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoFocus
                className={STYLES.input}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              {submitContent}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
