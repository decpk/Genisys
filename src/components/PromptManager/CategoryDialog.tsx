import { useState, useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePromptManagerStore, type PmCategory } from '@/store/prompt-manager-store'

interface CategoryDialogProps {
  open: boolean
  folderId?: string
  category?: PmCategory
  onClose: () => void
}

const SELECT_CLASS = 'flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none'

export function CategoryDialog({ open, folderId: propFolderId, category, onClose }: CategoryDialogProps): React.JSX.Element {
  const folders = usePromptManagerStore((s) => s.folders)
  const addCategory = usePromptManagerStore((s) => s.addCategory)
  const updateCategory = usePromptManagerStore((s) => s.updateCategory)
  const addFolder = usePromptManagerStore((s) => s.addFolder)

  const [name, setName] = useState(category?.name ?? '')
  const [selectedFolderId, setSelectedFolderId] = useState(propFolderId ?? '')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderError, setFolderError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '')
      setSelectedFolderId(propFolderId ?? folders[0]?.id ?? '')
      setCreatingFolder(false)
      setNewFolderName('')
      setFolderError('')
      setCategoryError('')
    }
  }, [open, category, propFolderId, folders])

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose()
        setName('')
      }
    },
    [onClose],
  )

  const handleFolderChange = useCallback((value: string) => {
    if (value === '__new__') {
      setCreatingFolder(true)
      return
    }
    setSelectedFolderId(value)
  }, [])

  const handleCreateFolder = useCallback(async () => {
    const trimmed = newFolderName.trim()
    if (!trimmed) return
    const duplicate = folders.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) {
      setFolderError(`Folder "${trimmed}" already exists`)
      return
    }
    const folder = await addFolder(trimmed)
    setSelectedFolderId(folder.id)
    setCreatingFolder(false)
    setNewFolderName('')
    setFolderError('')
  }, [newFolderName, folders, addFolder])

  const handleSave = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (category) {
      const categories = usePromptManagerStore.getState().categories
      const duplicate = categories.some((c) => c.id !== category.id && c.folderId === category.folderId && c.name.toLowerCase() === trimmed.toLowerCase())
      if (duplicate) {
        setCategoryError(`Category "${trimmed}" already exists in this folder`)
        return
      }
      await updateCategory(category.id, { name: trimmed })
    } else if (selectedFolderId) {
      const categories = usePromptManagerStore.getState().categories
      const duplicate = categories.some((c) => c.folderId === selectedFolderId && c.name.toLowerCase() === trimmed.toLowerCase())
      if (duplicate) {
        setCategoryError(`Category "${trimmed}" already exists in this folder`)
        return
      }
      await addCategory(selectedFolderId, trimmed)
    }
    onClose()
    setName('')
  }, [name, selectedFolderId, category, addCategory, updateCategory, onClose])

  const isEditing = !!category

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setCategoryError('') }}
              placeholder="Category name"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && !creatingFolder) handleSave() }}
            />
            {categoryError && <p className="text-[10px] text-destructive mt-1">{categoryError}</p>}
          </div>

          {/* Folder picker — only for new categories */}
          {!isEditing && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Folder</label>
              {creatingFolder ? (
                <>
                  <div className="flex gap-1.5">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder()
                        if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); setFolderError('') }
                      }}
                      className="h-9"
                    />
                    <Button size="sm" className="h-9 px-2.5 shrink-0" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                      <Plus size={14} />
                    </Button>
                  </div>
                  {folderError && <p className="text-[10px] text-destructive mt-1">{folderError}</p>}
                </>
              ) : (
                <select
                  value={selectedFolderId}
                  onChange={(e) => handleFolderChange(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {folders.length === 0 && <option value="">No folders — create one</option>}
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                  <option value="__new__">+ New Folder</option>
                </select>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || (!isEditing && !selectedFolderId)}>
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
