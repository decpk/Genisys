import { memo, useCallback, useMemo } from 'react'
import { FileText, ImageIcon, Pin, Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('clipboard')
import { useClipboardStore } from '@/store/clipboard-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import type { TimelineItemCardProps } from './TimelineItemCard.types'
import {
  TIMELINE_DOT,
  TIMELINE_DOT_TEXT,
  TIMELINE_DOT_IMAGE,
  TIMELINE_CARD_ROOT,
  TIMELINE_CARD_INNER,
  TIMELINE_CARD_TIME,
  TIMELINE_CARD_BODY,
  TIMELINE_CARD_TYPE_ROW,
  TIMELINE_CARD_TYPE_ICON,
  TIMELINE_CARD_TYPE_LABEL,
  TIMELINE_CARD_PREVIEW,
  TIMELINE_CARD_IMAGE_DESC,
  TIMELINE_CARD_FOOTER,
  TIMELINE_CARD_PIN,
  TIMELINE_CARD_LABEL_DOT,
  TIMELINE_CARD_SIZE,
  TIMELINE_CARD_ACTIONS,
} from './TimelineItemCard.styles'

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const TimelineItemCard = memo(function TimelineItemCard(
  props: TimelineItemCardProps
): React.JSX.Element {
  const { item } = props

  const openPreview = useClipboardStore((s) => s.openPreview)
  const copyToClipboard = useClipboardStore((s) => s.copyToClipboard)
  const removeItem = useClipboardStore((s) => s.removeItem)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const handleClick = useCallback(() => {
    openPreview(item.id)
  }, [openPreview, item.id])

  const handleCopy = useCallback(async () => {
    await copyToClipboard(item.id)
    toast.success('Copied to clipboard')
  }, [copyToClipboard, item.id])

  const handleDelete = useCallback(() => {
    openConfirmDialog({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this clipboard item?',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await removeItem(item.id)
      },
    })
  }, [openConfirmDialog, removeItem, item.id])

  const timeLabel = useMemo(() => formatTime(item.createdAt), [item.createdAt])
  const sizeLabel = useMemo(() => formatByteSize(item.byteSize), [item.byteSize])

  const isText = item.contentType === 'text'
  const TypeIcon = isText ? FileText : ImageIcon
  const dotColor = isText ? TIMELINE_DOT_TEXT : TIMELINE_DOT_IMAGE

  const previewContent = useMemo(() => {
    if (isText && item.textContent) return item.textContent
    return null
  }, [isText, item.textContent])

  const imageDesc = useMemo(() => {
    if (!isText && item.imageDescription) return item.imageDescription
    if (!isText) return 'Image — no description'
    return null
  }, [isText, item.imageDescription])

  const hasLabels = item.labels.length > 0
  const showFooter = item.isPinned || hasLabels

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={TIMELINE_CARD_ROOT} onClick={handleClick} role="button" tabIndex={0}>
          <div className={cn(TIMELINE_DOT, dotColor)} />

          <div className={TIMELINE_CARD_INNER}>
            <span className={TIMELINE_CARD_TIME}>{timeLabel}</span>
            <div className={TIMELINE_CARD_BODY}>
              <div className={TIMELINE_CARD_TYPE_ROW}>
                <TypeIcon className={TIMELINE_CARD_TYPE_ICON} />
                <span className={TIMELINE_CARD_TYPE_LABEL}>
                  {isText ? 'Text' : 'Image'}
                </span>
                <span className={TIMELINE_CARD_SIZE}>{sizeLabel}</span>
                <div className={TIMELINE_CARD_ACTIONS}>
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    variant="ghost"
                    size="xs"
                    tooltip="Copy"
                    tooltipSide="top"
                  >
                    <Copy size={11} />
                  </IconButton>
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    variant="destructive"
                    size="xs"
                    tooltip="Delete"
                    tooltipSide="top"
                  >
                    <Trash2 size={11} />
                  </IconButton>
                </div>
              </div>

              {previewContent && (
                <p className={TIMELINE_CARD_PREVIEW}>{previewContent}</p>
              )}

              {imageDesc && (
                <p className={TIMELINE_CARD_IMAGE_DESC}>{imageDesc}</p>
              )}

              {showFooter && (
                <div className={TIMELINE_CARD_FOOTER}>
                  {item.isPinned && <Pin className={TIMELINE_CARD_PIN} />}
                  {hasLabels &&
                    item.labels.map((label) => (
                      <Tooltip key={label.id} content={label.name} side="top" delayMs={150}>
                        <span
                          className={TIMELINE_CARD_LABEL_DOT}
                          style={{ backgroundColor: label.color }}
                        />
                      </Tooltip>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="size-3.5 mr-2" />
          Copy to Clipboard
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="size-3.5 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})
