import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useApiClientStore } from '@/store/api-client-store'

interface NewFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string | null
}

export function NewFolderDialog(props: NewFolderDialogProps): React.JSX.Element {
  const { open, onOpenChange, collectionId } = props
  const addFolder = useApiClientStore((s) => s.addFolder)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim() || !collectionId) return
    setError(null)
    try {
      await addFolder(collectionId, name.trim())
      setName('')
      onOpenChange(false)
    } catch (err) {
      console.error('[api-client] Failed to create folder:', err)
      setError(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="My Folder"
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
