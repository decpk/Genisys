import { memo } from 'react'

import { ClipboardImageThumb } from './ClipboardImageThumb'
import { useClipboardImageStripData } from './useClipboardImageStripData'
import { MAX_IMAGES_VISIBLE } from '../../ClipboardQuickAccessTile.constants'

/**
 * Horizontal, scrollable strip of recent clipboard images shown at the top
 * of the dashboard's Clipboard Quick Access tile. Clicking a thumbnail opens
 * the same `ClipboardPreviewModal` used in the Clipboard Manager via the
 * shared `useClipboardStore.openPreview` action.
 *
 * Renders nothing when there are no image items so the tile collapses
 * cleanly to its existing layout.
 */
export const ClipboardImageStrip = memo(function ClipboardImageStrip(): React.JSX.Element | null {
  const { images, totalImages, onSelect } = useClipboardImageStripData()

  if (images.length === 0) return null

  const overflow = Math.max(0, totalImages - MAX_IMAGES_VISIBLE)

  return (
    <div className="relative shrink-0 border-b border-border/40">
      {/* Fade masks — scroll indicator hint that the strip is horizontally scrollable */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-card to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent z-10" />

      <div className="flex items-center gap-1.5 px-2.5 py-2 overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth">
        {images.map((item) => (
          <ClipboardImageThumb
            key={item.id}
            item={item}
            onSelect={onSelect}
          />
        ))}
        {overflow > 0 && (
          <span className="shrink-0 px-2 text-[10px] text-muted-foreground">
            +{overflow}
          </span>
        )}
      </div>
    </div>
  )
})
