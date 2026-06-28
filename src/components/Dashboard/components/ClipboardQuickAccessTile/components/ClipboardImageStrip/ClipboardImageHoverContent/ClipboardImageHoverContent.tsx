import { memo } from 'react'

import { ClipboardImageHoverMeta } from './ClipboardImageHoverMeta'
import { ClipboardImageHoverPreview } from './ClipboardImageHoverPreview'
import { ClipboardImageHoverTabs } from './ClipboardImageHoverTabs'
import { clipboardImageHoverContentStyles as styles } from './ClipboardImageHoverContent.styles'
import { useClipboardImageHoverContentData } from './useClipboardImageHoverContentData'
import type { ClipboardImageHoverContentProps } from './ClipboardImageHoverContent.types'

/**
 * Popover content rendered inside `<HoverCardContent>` when the user
 * hovers a thumbnail in the dashboard's clipboard image strip.
 *
 * Vertical layout (50%×50% of the window):
 *   1. Full-resolution image preview (flex-1, letterboxed via
 *      `object-contain` so any aspect ratio looks even).
 *   2. Slim metadata strip with the captured date+time.
 *   3. Two interactive tabs — "Description" and "Text in Image" —
 *      each rendering selectable text or a pending / empty state.
 */
export const ClipboardImageHoverContent = memo(function ClipboardImageHoverContent(
  props: ClipboardImageHoverContentProps
): React.JSX.Element {
  const { item } = props
  const { isLoading, hasError, dataUrl } = useClipboardImageHoverContentData({
    imagePath: item.imagePath,
    thumbnailPath: item.thumbnailPath,
  })

  const alt = item.imageDescription ?? 'Clipboard image preview'

  return (
    <div className={styles.root}>
      <div className={styles.imageRegion}>
        <ClipboardImageHoverPreview
          isLoading={isLoading}
          hasError={hasError}
          dataUrl={dataUrl}
          alt={alt}
        />
      </div>
      <ClipboardImageHoverMeta createdAt={item.createdAt} />
      <div className={styles.tabsRegion}>
        <ClipboardImageHoverTabs item={item} />
      </div>
    </div>
  )
})
