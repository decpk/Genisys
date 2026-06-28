import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useApiClientStore } from '@/store/api-client-store'
import { COLLECTION_COLORS } from '../../APIClient.constants'

interface NewCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewCollectionDialog(props: NewCollectionDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const addCollection = useApiClientStore((s) => s.addCollection)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setError(null)
    try {
      await addCollection(name.trim(), color)
      setName('')
      setColor('')
      onOpenChange(false)
    } catch (err) {
      console.error('[api-client] Failed to create collection:', err)
      setError(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Failed to create collection')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="My API Collection"
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Color</label>
            <div className="flex gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c || 'none'}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-colors ${
                    color === c ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c || 'var(--muted)' }}
                />
              ))}
            </div>
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
