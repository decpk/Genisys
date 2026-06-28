import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { RepoUrlInput } from '../../RepoUrlInput'
import type { AddRepoDialogProps } from './AddRepoDialog.types'

export function AddRepoDialog({
  open,
  onOpenChange,
  onSubmit
}: AddRepoDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Browse Repository</DialogTitle>
          <DialogDescription>
            Enter a local directory path to explore its contents
          </DialogDescription>
        </DialogHeader>
        <RepoUrlInput
          onSubmit={(repo) => {
            onOpenChange(false)
            onSubmit(repo)
          }}
          isLoading={false}
          compact
        />
      </DialogContent>
    </Dialog>
  )
}
