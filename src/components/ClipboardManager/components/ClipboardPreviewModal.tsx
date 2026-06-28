import { useEffect, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  FolderOpen,
  ImageIcon,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('clipboard')
import { useClipboardStore } from '@/store/clipboard-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import {
  Dialog,
  DialogPortal,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { LabelBadge } from './LabelBadge'
import { LabelSelector } from './LabelSelector'
import { ImageFullPreview } from './ImageFullPreview'
import { ClipboardTextContent } from './ClipboardTextContent'
import { formatTimeAgo } from '../utils/formatTimeAgo'
import { formatByteSize } from '../utils/formatByteSize'
import { analyzeSensitivity, maskSensitiveText } from '../utils/sensitive-data'
import { getFilteredItems } from '../utils/getFilteredItems'
import { revealClipboardImage } from '../api/revealClipboardImage'

export function ClipboardPreviewModal(): React.JSX.Element | null {
  const previewItemId = useClipboardStore((s) => s.previewItemId)
  const allItems = useClipboardStore((s) => s.items)
  const filter = useClipboardStore((s) => s.filter)
  const closePreview = useClipboardStore((s) => s.closePreview)
  const previewNext = useClipboardStore((s) => s.previewNext)
  const previewPrev = useClipboardStore((s) => s.previewPrev)
  const copyToClipboard = useClipboardStore((s) => s.copyToClipboard)
  const removeItem = useClipboardStore((s) => s.removeItem)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const filteredItems = useMemo(() => getFilteredItems(allItems, filter), [allItems, filter])

  const isOpen = previewItemId !== null
  const currentIndex = previewItemId !== null ? filteredItems.findIndex((i) => i.id === previewItemId) : -1
  const item = currentIndex !== -1 ? filteredItems[currentIndex] : null
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex !== -1 && currentIndex < filteredItems.length - 1

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isEditable = tag === 'TEXTAREA' || tag === 'INPUT' || (e.target as HTMLElement)?.isContentEditable
      if (isEditable) return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        previewPrev()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        previewNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        closePreview()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, previewNext, previewPrev, closePreview])

  const handleCopy = useCallback(async () => {
    if (!item) return
    await copyToClipboard(item.id)
    toast.success('Copied to clipboard')
  }, [copyToClipboard, item])

  const handleRevealInFinder = useCallback(() => {
    if (!item || item.contentType !== 'image' || !item.imagePath) return
    const imagePath = item.imagePath
    void (async () => {
      try {
        await revealClipboardImage(imagePath)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to reveal image')
      }
    })()
  }, [item])

  const handleDelete = useCallback(() => {
    if (!item) return
    openConfirmDialog({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this clipboard item?',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        const idx = filteredItems.findIndex((i) => i.id === item.id)
        await removeItem(item.id)
        const remaining = filteredItems.length - 1
        if (remaining === 0) {
          closePreview()
        } else if (idx >= remaining) {
          useClipboardStore.setState({ previewItemId: filteredItems[idx - 1]?.id ?? null })
        } else {
          useClipboardStore.setState({ previewItemId: filteredItems[idx + 1]?.id ?? null })
        }
      },
    })
  }, [openConfirmDialog, removeItem, item, filteredItems, closePreview])

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closePreview() }}>
      <DialogPortal>
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm pointer-events-none" />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Navigation: Previous */}
          <button
            onClick={previewPrev}
            disabled={!hasPrev}
            className={cn(
              'absolute left-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur border border-border/50 transition-opacity',
              hasPrev ? 'opacity-70 hover:opacity-100 hover:bg-accent' : 'opacity-20 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Main content */}
          <div className="w-[95vw] h-[95vh] mx-16 rounded-xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 shrink-0">
              {item.contentType === 'text' ? (
                <FileText size={15} className="text-muted-foreground" />
              ) : (
                <ImageIcon size={15} className="text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground capitalize">{item.contentType}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatByteSize(item.byteSize)}</span>
              {item.labels.length > 0 && (
                <div className="flex items-center gap-1 ml-1">
                  {item.labels.slice(0, 3).map((label) => (
                    <LabelBadge key={label.id} name={label.name} color={label.color} size="sm" />
                  ))}
                  {item.labels.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{item.labels.length - 3}</span>
                  )}
                </div>
              )}

              <span className="text-xs text-muted-foreground/50 ml-auto tabular-nums">
                {currentIndex + 1} / {filteredItems.length}
              </span>

              <IconButton
                onClick={closePreview}
                variant="ghost"
                size="sm"
                className="ml-1"
              >
                <X size={16} />
              </IconButton>
            </div>

            {/* Content */}
            {item.contentType === 'text' ? (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <ModalTextContent text={item.textContent ?? ''} />
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-hidden relative">
                <ImageFullPreview
                  imagePath={item.imagePath}
                  imageDescription={item.imageDescription}
                  analysisStatus={item.analysisStatus}
                  extractedText={item.extractedText}
                  itemId={item.id}
                />
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-border/50 shrink-0">
              <Button
                onClick={handleCopy}
                size="xs"
              >
                <Copy size={13} />
                Copy
              </Button>
              <LabelSelector itemId={item.id} assignedLabels={item.labels}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Tag size={13} />
                  Labels
                </button>
              </LabelSelector>
              {item.contentType === 'image' && item.imagePath && (
                <Button
                  onClick={handleRevealInFinder}
                  size="xs"
                  variant="ghost"
                >
                  <FolderOpen size={13} />
                  Reveal in Finder
                </Button>
              )}
              <div className="flex-1" />
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="xs"
              >
                <Trash2 size={13} />
                Delete
              </Button>
            </div>
          </div>

          {/* Navigation: Next */}
          <button
            onClick={previewNext}
            disabled={!hasNext}
            className={cn(
              'absolute right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur border border-border/50 transition-opacity',
              hasNext ? 'opacity-70 hover:opacity-100 hover:bg-accent' : 'opacity-20 cursor-not-allowed'
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </DialogPortal>
    </Dialog>
  )
}

function ModalTextContent({ text }: { text: string }): React.JSX.Element {
  const displayText = useMemo(() => {
    const result = analyzeSensitivity(text)
    if (result.level === 'none') return text
    return maskSensitiveText(text, result.matches)
  }, [text])

  return <ClipboardTextContent text={text} displayText={displayText} mode="modal" />
}
