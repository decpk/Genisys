import { memo } from 'react'
import { Pin } from 'lucide-react'

import { cn } from '@/lib/utils'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

import { IMAGE_STRIP_THUMB_SIZE } from '../../../ClipboardQuickAccessTile.constants'
import { ClipboardHoverBackdrop } from '../ClipboardHoverBackdrop'
import { ClipboardImageHoverContent } from '../ClipboardImageHoverContent'

import { ClipboardImageThumbBody } from './ClipboardImageThumbBody'
import { useClipboardImageThumbData } from './useClipboardImageThumbData'
import type { ClipboardImageThumbProps } from './ClipboardImageThumb.types'

/**
 * Renders a single clipboard image as a square thumbnail tile. Wrapped
 * in a Radix HoverCard so hovering opens a 50%×50%-of-window preview
 * popover with the full-resolution image, capture metadata and two
 * interactive tabs. The surrounding UI fades behind a blurred scrim
 * (`ClipboardHoverBackdrop`) while the active thumbnail is lifted
 * above the scrim so it stays sharp. Click still opens the existing
 * `ClipboardPreviewModal` via `onSelect`.
 */
export const ClipboardImageThumb = memo(function ClipboardImageThumb(
  props: ClipboardImageThumbProps
): React.JSX.Element {
  const { item, onSelect } = props
  const {
    triggerRef,
    dataUrl,
    hasError,
    isHoverOpen,
    onHoverOpenChange,
    popoverWidth,
    popoverHeight,
  } = useClipboardImageThumbData({ thumbnailPath: item.thumbnailPath })

  const altText = item.imageDescription ?? 'Clipboard image'

  const handleClick = (): void => {
    onSelect(item.id)
  }

  return (
    <>
      <ClipboardHoverBackdrop open={isHoverOpen} />
      <HoverCard
        openDelay={250}
        closeDelay={120}
        open={isHoverOpen}
        onOpenChange={onHoverOpenChange}
      >
        <HoverCardTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            onClick={handleClick}
            style={{
              width: IMAGE_STRIP_THUMB_SIZE,
              height: IMAGE_STRIP_THUMB_SIZE,
            }}
            className={cn(
              'relative shrink-0 rounded-md overflow-hidden bg-muted/30',
              'ring-1 ring-border/40 hover:ring-primary/60 transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
              'cursor-pointer',
              isHoverOpen && 'z-[45] ring-2 ring-primary/80 shadow-2xl shadow-black/40 scale-105'
            )}
          >
            <ClipboardImageThumbBody
              dataUrl={dataUrl}
              hasError={hasError}
              alt={altText}
            />
            {item.isPinned && (
              <div className="absolute top-0.5 right-0.5 rounded-full bg-background/80 backdrop-blur-sm p-0.5 shadow-sm">
                <Pin size={10} className="text-amber-500" fill="currentColor" />
              </div>
            )}
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          side="bottom"
          align="center"
          sideOffset={14}
          collisionPadding={16}
          style={{ width: popoverWidth, height: popoverHeight }}
          className="p-0 overflow-hidden rounded-2xl border-border/60 bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/40"
        >
          <ClipboardImageHoverContent item={item} />
        </HoverCardContent>
      </HoverCard>
    </>
  )
})
