import { useState, useCallback, useMemo } from 'react'
import { Download, Folder, FileText, Tag, AlertCircle } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePromptManagerStore } from '@/store/prompt-manager-store'
import { parseSharePayload, type PmSharePayload } from './pm-share'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

interface ImportDialogProps {
  open: boolean
  onClose: () => void
}

export function ImportDialog({ open, onClose }: ImportDialogProps): React.JSX.Element {
  const folders = usePromptManagerStore((s) => s.folders)
  const categories = usePromptManagerStore((s) => s.categories)
  const importFolder = usePromptManagerStore((s) => s.importFolder)
  const importPrompt = usePromptManagerStore((s) => s.importPrompt)

  const [raw, setRaw] = useState('')
  const [targetFolderId, setTargetFolderId] = useState('')
  const [targetCategoryId, setTargetCategoryId] = useState('')

  const parsed = useMemo<PmSharePayload | null>(() => {
    if (!raw.trim()) return null
    return parseSharePayload(raw)
  }, [raw])

  const folderCategories = useMemo(
    () => categories.filter((c) => c.folderId === targetFolderId).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, targetFolderId],
  )

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose()
        setRaw('')
        setTargetFolderId('')
        setTargetCategoryId('')
      }
    },
    [onClose],
  )

  const handleFolderChange = useCallback(
    (fId: string) => {
      setTargetFolderId(fId)
      const firstCat = categories.find((c) => c.folderId === fId)
      setTargetCategoryId(firstCat?.id ?? '')
    },
    [categories],
  )

  const handleImport = useCallback(async () => {
    if (!parsed) return

    if (parsed.kind === 'folder' && parsed.folder && parsed.categories && parsed.catMap) {
      await importFolder(parsed.folder, parsed.categories, parsed.prompts, parsed.catMap)
      toast.success('Folder imported', {
        description: `"${parsed.folder.name}" with ${parsed.prompts.length} prompt${parsed.prompts.length !== 1 ? 's' : ''}`,
      })
    } else if (parsed.kind === 'prompt' && targetCategoryId && targetFolderId) {
      await importPrompt(parsed.prompts[0], targetCategoryId, targetFolderId)
      toast.success('Prompt imported', {
        description: `"${parsed.prompts[0].title}"`,
      })
    }

    onClose()
    setRaw('')
    setTargetFolderId('')
    setTargetCategoryId('')
  }, [parsed, targetCategoryId, targetFolderId, importFolder, importPrompt, onClose])

  const canImport =
    parsed &&
    (parsed.kind === 'folder' || (parsed.kind === 'prompt' && targetCategoryId && targetFolderId))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={16} /> Import Shared Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paste area */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Paste shared data
            </label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Paste the shared code here…"
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-2 text-xs shadow-xs transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none resize-y placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          {/* Parse error */}
          {raw.trim() && !parsed && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              <AlertCircle size={14} />
              Invalid share data. Make sure you pasted the full code.
            </div>
          )}

          {/* Preview */}
          {parsed && (
            <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                {parsed.kind === "folder" ? (
                  <Folder size={14} />
                ) : (
                  <FileText size={14} />
                )}
                {parsed.kind === "folder"
                  ? "Importing Folder"
                  : "Importing Prompt"}
              </div>

              {parsed.kind === "folder" && parsed.folder && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {parsed.folder.color && (
                      <span
                        className="size-3 rounded-sm shrink-0"
                        style={{ backgroundColor: parsed.folder.color }}
                      />
                    )}
                    <span className="text-sm font-medium">
                      {parsed.folder.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.categories?.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5"
                      >
                        <Tag size={10} /> {c.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {parsed.prompts.length} prompt
                    {parsed.prompts.length !== 1 ? "s" : ""} •{" "}
                    {parsed.categories?.length ?? 0} categor
                    {(parsed.categories?.length ?? 0) !== 1 ? "ies" : "y"}
                  </p>
                </div>
              )}

              {parsed.kind === "prompt" && (
                <div className="space-y-1.5">
                  <span className="text-sm font-medium">
                    {parsed.prompts[0].title}
                  </span>
                  {parsed.prompts[0].description && (
                    <p className="text-xs text-muted-foreground">
                      {parsed.prompts[0].description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/70 line-clamp-2">
                    {parsed.prompts[0].content.slice(0, 150)}
                    {parsed.prompts[0].content.length > 150 ? "…" : ""}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Target selection for single prompt import */}
          {parsed?.kind === "prompt" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Target Folder
                </label>
                <select
                  value={targetFolderId}
                  onChange={(e) => handleFolderChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none"
                >
                  <option value="">Select folder…</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Target Category
                </label>
                <select
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  disabled={!targetFolderId}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none disabled:opacity-50"
                >
                  <option value="">Select category…</option>
                  {folderCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!canImport}>
            <Download size={14} /> Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
