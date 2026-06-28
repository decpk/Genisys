import { useState, useCallback } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePromptManagerStore, type PmFolder } from '@/store/prompt-manager-store'
import type { PromptScopeApp } from '@/lib/prompt-scope'

import { FolderScopeSelector } from './FolderScopeSelector'

const FOLDER_COLORS = [
  '', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface FolderDialogProps {
  open: boolean
  folder?: PmFolder
  onClose: () => void
}

export function FolderDialog({ open, folder, onClose }: FolderDialogProps): React.JSX.Element {
  const folders = usePromptManagerStore((s) => s.folders)
  const addFolder = usePromptManagerStore((s) => s.addFolder)
  const updateFolder = usePromptManagerStore((s) => s.updateFolder)

  const [name, setName] = useState(folder?.name ?? '')
  const [color, setColor] = useState(folder?.color ?? '')
  const [scopes, setScopes] = useState<PromptScopeApp[]>(
    (folder?.scopes as PromptScopeApp[] | undefined) ?? [],
  )
  const [error, setError] = useState('')

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose()
        setName('')
        setColor('')
        setScopes([])
        setError('')
      } else {
        setName(folder?.name ?? '')
        setColor(folder?.color ?? '')
        setScopes((folder?.scopes as PromptScopeApp[] | undefined) ?? [])
        setError('')
      }
    },
    [folder, onClose],
  )

  const handleSave = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (folder) {
      const duplicate = folders.some((f) => f.id !== folder.id && f.name.toLowerCase() === trimmed.toLowerCase())
      if (duplicate) {
        setError(`Folder "${trimmed}" already exists`)
        return
      }
      if (folder.isBuiltIn) {
        // Built-ins ignore name/color changes; only the scope is editable.
        await updateFolder(folder.id, { scopes })
      } else {
        await updateFolder(folder.id, { name: trimmed, color, scopes })
      }
    } else {
      const duplicate = folders.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())
      if (duplicate) {
        setError(`Folder "${trimmed}" already exists`)
        return
      }
      await addFolder(trimmed, color, scopes)
    }
    onClose()
    setName('')
    setColor('')
    setScopes([])
    setError('')
  }, [name, color, scopes, folder, folders, addFolder, updateFolder, onClose])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{folder ? 'Edit Folder' : 'New Folder'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Folder name"
              autoFocus
              disabled={folder?.isBuiltIn}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            />
            {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
            {folder?.isBuiltIn && (
              <p className="text-[10px] text-muted-foreground/80 mt-1">
                Built-in folders can't be renamed, but you can still control which apps see them.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c || 'none'}
                  className={`size-7 rounded-md border-2 cursor-pointer transition-all ${
                    color === c ? 'border-primary scale-110' : 'border-transparent hover:border-border'
                  } ${folder?.isBuiltIn ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ backgroundColor: c || 'var(--color-muted)' }}
                  onClick={() => setColor(c)}
                  disabled={folder?.isBuiltIn}
                />
              ))}
            </div>
          </div>
          <FolderScopeSelector value={scopes} onChange={setScopes} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {folder ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
