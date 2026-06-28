import { useState, useCallback, useMemo } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePromptManagerStore, type PmPrompt } from '@/store/prompt-manager-store'

interface MovePromptDialogProps {
  open: boolean
  prompt?: PmPrompt
  onClose: () => void
}

export function MovePromptDialog({ open, prompt, onClose }: MovePromptDialogProps): React.JSX.Element {
  const folders = usePromptManagerStore((s) => s.folders)
  const categories = usePromptManagerStore((s) => s.categories)
  const movePrompt = usePromptManagerStore((s) => s.movePrompt)

  const [targetFolderId, setTargetFolderId] = useState('')
  const [targetCategoryId, setTargetCategoryId] = useState('')

  const folderCategories = useMemo(
    () => categories.filter((c) => c.folderId === targetFolderId).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, targetFolderId],
  )

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose()
        setTargetFolderId('')
        setTargetCategoryId('')
      }
    },
    [onClose],
  )

  const handleFolderChange = useCallback(
    (newFolderId: string) => {
      setTargetFolderId(newFolderId)
      const firstCat = categories.find((c) => c.folderId === newFolderId)
      setTargetCategoryId(firstCat?.id ?? '')
    },
    [categories],
  )

  const handleMove = useCallback(async () => {
    if (!prompt || !targetCategoryId || !targetFolderId) return
    await movePrompt(prompt.id, targetCategoryId, targetFolderId)
    onClose()
    setTargetFolderId('')
    setTargetCategoryId('')
  }, [prompt, targetCategoryId, targetFolderId, movePrompt, onClose])

  const isSameLocation = prompt?.categoryId === targetCategoryId

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Prompt</DialogTitle>
        </DialogHeader>
        {prompt && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Moving <span className="font-medium text-foreground">{prompt.title}</span>
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Folder</label>
              <select
                value={targetFolderId}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none"
              >
                <option value="">Select folder…</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Category</label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                disabled={!targetFolderId}
                className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none disabled:opacity-50"
              >
                <option value="">Select category…</option>
                {folderCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleMove} disabled={!targetCategoryId || isSameLocation}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
