import { useCallback, useMemo, useState } from 'react'
import {
  Copy,
  Pencil,
  Trash2,
  MoveRight,
  Share2,
  Folder,
  Tag,
  Import,
  Lock,
} from "lucide-react";
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePromptManagerStore, type PmPrompt } from '@/store/prompt-manager-store'
import { sharePrompt } from '@/components/PromptManager/pm-share'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

interface PmPromptViewerDialogProps {
  open: boolean
  prompt: PmPrompt | null
  onOpenChange: (open: boolean) => void
  onEdit: (prompt: PmPrompt) => void
  onMove: (prompt: PmPrompt) => void
  onUse: (prompt: PmPrompt) => void
}

export function PmPromptViewerDialog({
  open,
  prompt,
  onOpenChange,
  onEdit,
  onMove,
  onUse,
}: PmPromptViewerDialogProps): React.JSX.Element {
  const removePrompt = usePromptManagerStore((s) => s.removePrompt)
  const categories = usePromptManagerStore((s) => s.categories)
  const folders = usePromptManagerStore((s) => s.folders)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const category = useMemo(
    () => categories.find((c) => c.id === prompt?.categoryId),
    [categories, prompt?.categoryId],
  )
  const folder = useMemo(
    () => folders.find((f) => f.id === prompt?.folderId),
    [folders, prompt?.folderId],
  )

  const handleCopy = useCallback(async () => {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt.content)
    toast.success('Copied to clipboard')
  }, [prompt])

  const handleDelete = useCallback(() => {
    if (!prompt) return
    removePrompt(prompt.id)
    setShowDeleteConfirm(false)
    onOpenChange(false)
  }, [removePrompt, prompt, onOpenChange])

  const handleShare = useCallback(() => {
    if (!prompt) return
    sharePrompt(prompt)
  }, [prompt])

  if (!prompt) return <></>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-[70vw] h-[80vh] sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-border/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold truncate tracking-tight">
                  {prompt.title}
                </h2>
                {prompt.isBuiltIn && <Lock size={11} className="text-muted-foreground/45" />}
              </div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {folder && (
                  <div className="flex items-center gap-1">
                    {folder.color ? (
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                    ) : (
                      <Folder size={9} className="text-muted-foreground/40" />
                    )}
                    <span className="text-[10px] text-muted-foreground/50 font-medium">
                      {folder.name}
                    </span>
                  </div>
                )}
                {folder && category && (
                  <span className="text-[10px] text-muted-foreground/30">
                    ›
                  </span>
                )}
                {category && (
                  <div className="flex items-center gap-1">
                    <Tag size={8} className="text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/50 font-medium">
                      {category.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <button
              onClick={() => {
                onUse(prompt);
                onOpenChange(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
            >
              <Import size={11} /> Use in Chat
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border border-border/40 text-foreground/80 hover:text-foreground hover:bg-secondary/50 transition-all cursor-pointer"
            >
              <Copy size={11} /> Copy
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border border-border/40 text-foreground/80 hover:text-foreground hover:bg-secondary/50 transition-all cursor-pointer"
            >
              <Share2 size={11} /> Share
            </button>
            {!prompt.isBuiltIn && <div className="w-px h-4 bg-border/30 mx-1" />}
            {!prompt.isBuiltIn && (
              <button
                onClick={() => {
                  onEdit(prompt);
                  onOpenChange(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border border-border/40 text-foreground/80 hover:text-foreground hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <Pencil size={11} /> Edit
              </button>
            )}
            {!prompt.isBuiltIn && (
              <button
                onClick={() => {
                  onMove(prompt);
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border border-border/40 text-foreground/80 hover:text-foreground hover:bg-secondary/50 transition-all cursor-pointer"
              >
                <MoveRight size={11} /> Move
              </button>
            )}
            {!prompt.isBuiltIn && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border border-border/40 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
              >
                <Trash2 size={11} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Delete confirmation */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete prompt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{prompt.title}&rdquo;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className={cn(buttonVariants({ variant: 'destructive' }))}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Description */}
        {prompt.description && (
          <div className="shrink-0 px-4 py-2.5 border-b border-border/30 bg-muted/20">
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              {prompt.description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <MarkdownRenderer content={prompt.content} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
