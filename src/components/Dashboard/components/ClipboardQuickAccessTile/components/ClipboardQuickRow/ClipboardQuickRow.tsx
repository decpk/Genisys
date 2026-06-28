import { memo } from 'react'
import { Pin, Image as ImageIcon, Tag } from 'lucide-react'

import type { ClipboardItem } from '@/store/clipboard-store/clipboard-store.types'

import { formatPreview } from '../../utils/formatPreview'

interface ClipboardQuickRowProps {
  item: ClipboardItem
  onCopy: (id: string) => void
}

export const ClipboardQuickRow = memo(function ClipboardQuickRow(
  props: ClipboardQuickRowProps
): React.JSX.Element {
  const { item, onCopy } = props
  const isImage = item.contentType === 'image'
  const preview = isImage
    ? item.imageDescription || item.extractedText || 'Image'
    : formatPreview(item.textContent)
  const primaryLabel = item.labels[0]
  const extraLabelCount = Math.max(0, item.labels.length - 1)

  const handleClick = (): void => onCopy(item.id)

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group/row w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary/50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
    >
      {/* Leading status icon */}
      <div className="shrink-0 h-6 w-6 rounded-md bg-secondary/60 border border-border/40 flex items-center justify-center">
        {item.isPinned ? (
          <Pin size={11} className="text-amber-500" fill="currentColor" />
        ) : isImage ? (
          <ImageIcon size={11} className="text-muted-foreground" />
        ) : (
          <Tag size={11} className="text-primary" />
        )}
      </div>

      {/* Preview */}
      <span className="flex-1 min-w-0 text-[12px] text-foreground truncate">
        {preview}
      </span>

      {/* Label chip */}
      {primaryLabel && (
        <span
          className="shrink-0 inline-flex items-center gap-1 px-1.5 h-4 rounded text-[10px] font-medium leading-none"
          style={{
            backgroundColor: `${primaryLabel.color}20`,
            color: primaryLabel.color,
          }}
        >
          {primaryLabel.name}
          {extraLabelCount > 0 && (
            <span className="text-muted-foreground">+{extraLabelCount}</span>
          )}
        </span>
      )}
    </button>
  )
})
