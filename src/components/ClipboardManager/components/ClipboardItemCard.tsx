import { memo, useCallback, useMemo, useState } from 'react'
import { Copy, Tag, Trash2, Pin, ShieldAlert, FileText, ImageIcon, ScanText, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('clipboard')
import { Tooltip } from '@/components/Tooltip'
import { useClipboardStore } from '@/store/clipboard-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import type { ClipboardItem } from '@/store/clipboard-store'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ClipboardImagePreview } from './ClipboardImagePreview'
import { ClipboardTextContent } from './ClipboardTextContent'
import { IconButton } from '@/components/ui/icon-button'
import { LabelBadge } from './LabelBadge'
import { LabelSelector } from './LabelSelector'
import { ImageInfoPopover } from './ImageInfoPopover'
import { CategoryBadge } from './CategoryBadge'
import { SensitivityBadge } from './SensitivityBadge'
import { TransformMenu } from './TransformMenu'
import { ExtractedTextModal } from './ExtractedTextModal'
import { formatTimeAgo } from '../utils/formatTimeAgo'
import { formatByteSize } from '../utils/formatByteSize'
import { detectCategories, type SmartCollectionKey } from '../utils/smart-collections'
import { analyzeSensitivity, maskSensitiveText, type SensitiveMatch } from '../utils/sensitive-data'
import { revealClipboardImage } from '../api/revealClipboardImage'

const EMPTY_CATEGORIES: SmartCollectionKey[] = []
const EMPTY_MATCHES: SensitiveMatch[] = []

interface ClipboardItemCardProps {
  item: ClipboardItem;
}

export const ClipboardItemCard = memo(function ClipboardItemCard({
  item,
}: ClipboardItemCardProps): React.JSX.Element {
  const copyToClipboard = useClipboardStore((s) => s.copyToClipboard);
  const removeItem = useClipboardStore((s) => s.removeItem);
  const openPreview = useClipboardStore((s) => s.openPreview);
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(item.id);
    toast.success("Copied to clipboard");
  }, [copyToClipboard, item.id]);

  const handleDelete = useCallback(() => {
    openConfirmDialog({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this clipboard item?',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await removeItem(item.id);
      },
    });
  }, [openConfirmDialog, removeItem, item.id]);

  const handleOpenPreview = useCallback(() => {
    openPreview(item.id);
  }, [openPreview, item.id]);

  const handleRevealInFinder = useCallback(() => {
    if (item.contentType !== 'image' || !item.imagePath) return
    void (async () => {
      try {
        await revealClipboardImage(item.imagePath as string)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to reveal image')
      }
    })()
  }, [item.contentType, item.imagePath]);

  const handleTransformComplete = useCallback(async (result: string) => {
    try {
      await navigator.clipboard.writeText(result)
    } catch {
      // fallback silently
    }
  }, [])

  const hasLabels = item.labels.length > 0

  const categories = useMemo(() => {
    if (item.contentType !== 'text' || !item.textContent) return EMPTY_CATEGORIES
    if (item.smartCategories) return item.smartCategories
    return detectCategories(item.textContent)
  }, [item.contentType, item.textContent, item.smartCategories])

  const sensitivity = useMemo(() => {
    if (item.contentType !== 'text' || !item.textContent) return null
    if (item.sensitivityLevel !== undefined) {
      if (item.sensitivityLevel === 'none') return null
      return { level: item.sensitivityLevel, matches: item.sensitivityMatches ?? EMPTY_MATCHES }
    }
    const result = analyzeSensitivity(item.textContent)
    if (result.level === 'none') return null
    return result
  }, [item.contentType, item.textContent, item.sensitivityLevel, item.sensitivityMatches])

  const displayText = useMemo(() => {
    if (!item.textContent) return ''
    if (!sensitivity) return item.textContent
    return maskSensitiveText(item.textContent, sensitivity.matches)
  }, [item.textContent, sensitivity])

  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group mx-3 my-1.5 rounded-xl overflow-hidden",
            "bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]",
            "dark:shadow-[0_1px_4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)]",
            "transition-shadow duration-150",
            "hover:shadow-[0_3px_10px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)]",
            "dark:hover:shadow-[0_3px_12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]",
          )}
        >
          {/* Header bar */}
          <div className="flex items-center px-3 py-1.5 bg-secondary/40 dark:bg-secondary/25 border-b border-border/30">
            {/* Left group */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.contentType === "text" ? (
                <FileText
                  size={12}
                  className="text-muted-foreground/70 shrink-0"
                />
              ) : (
                <ImageIcon
                  size={12}
                  className="text-muted-foreground/70 shrink-0"
                />
              )}
              <span className="text-[11px] text-muted-foreground/70 font-medium">
                {item.contentType === "text" ? "Text" : "Image"}
              </span>
              {item.contentType === "image" && <ImageInfoPopover item={item} />}
              {item.contentType === "image" && item.extractedText && (
                <Tooltip content="View extracted text (OCR)" side="top">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOcrModalOpen(true); }}
                    className="p-0 shrink-0 hover:text-foreground transition-colors"
                  >
                    <ScanText size={12} className="text-emerald-500" />
                  </button>
                </Tooltip>
              )}
              <span className="text-[10px] text-muted-foreground/40">
                {formatByteSize(item.byteSize)}
              </span>
              {item.isPinned && (
                <Pin
                  size={11}
                  className="text-amber-500 shrink-0 fill-amber-500/30"
                />
              )}
              {sensitivity && (
                <ShieldAlert size={11} className="text-red-400 shrink-0" />
              )}
            </div>
            {/* Center: time */}
            <Tooltip
              content={new Date(item.createdAt).toLocaleString()}
              side="top"
            >
              <span className="shrink-0 text-[10px] text-muted-foreground/50 tabular-nums">
                {formatTimeAgo(item.createdAt)}
              </span>
            </Tooltip>
            {/* Right group */}
            <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
              {/* Hover actions in header */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  variant="ghost"
                  size="xs"
                  tooltip="Copy"
                  tooltipSide="top"
                >
                  <Copy size={12} />
                </IconButton>
                <Tooltip content="Labels" side="top">
                  <LabelSelector itemId={item.id} assignedLabels={item.labels}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-md hover:bg-accent/80 transition-colors"
                    >
                      <Tag size={12} className="text-muted-foreground" />
                    </button>
                  </LabelSelector>
                </Tooltip>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  variant="destructive"
                  size="xs"
                  tooltip="Delete"
                  tooltipSide="top"
                >
                  <Trash2 size={12} />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div
            className="px-3 py-2.5 cursor-pointer"
            onClick={handleOpenPreview}
          >
            {item.contentType === "text" ? (
              <ClipboardTextContent
                text={item.textContent ?? ''}
                displayText={displayText}
                mode="card"
              />
            ) : (
              <ClipboardImagePreview item={item} />
            )}

            {/* Badges */}
            {(hasLabels || categories.length > 0 || sensitivity) && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {hasLabels &&
                  item.labels.map((label) => (
                    <LabelBadge
                      key={label.id}
                      name={label.name}
                      color={label.color}
                    />
                  ))}
                {categories.map((cat) => (
                  <CategoryBadge key={cat} category={cat} />
                ))}
                {sensitivity && (
                  <SensitivityBadge
                    level={sensitivity.level}
                    matchCount={sensitivity.matches.length}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>
          <Copy size={14} className="mr-2" />
          Copy to Clipboard
        </ContextMenuItem>
        {item.contentType === "image" && item.extractedText && (
          <ContextMenuItem onClick={() => setOcrModalOpen(true)}>
            <ScanText size={14} className="mr-2" />
            View Extracted Text
          </ContextMenuItem>
        )}
        {item.contentType === "image" && item.imagePath && (
          <ContextMenuItem onClick={handleRevealInFinder}>
            <FolderOpen size={14} className="mr-2" />
            Reveal in Finder
          </ContextMenuItem>
        )}
        {item.contentType === "text" && item.textContent && (
          <>
            <ContextMenuSeparator />
            <TransformMenu
              text={item.textContent}
              onTransformComplete={handleTransformComplete}
            />
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    {item.contentType === "image" && item.extractedText && (
      <ExtractedTextModal
        open={ocrModalOpen}
        onOpenChange={setOcrModalOpen}
        extractedText={item.extractedText}
      />
    )}
    </>
  );
});
