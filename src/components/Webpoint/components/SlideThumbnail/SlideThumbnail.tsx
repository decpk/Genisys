import { slideBackgroundToCss } from '@/lib/webpoint/slideBackgroundToCss'

import { SlideThumbnailElement } from './components/SlideThumbnailElement'
import type { SlideThumbnailProps } from './SlideThumbnail.types'

const CONTAINER_STYLE: React.CSSProperties = {
  containerType: 'inline-size',
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}

/**
 * Lightweight, static DOM render of a slide (no iframe, no JS) used for
 * thumbnails. Element font sizes scale to the thumbnail width via container
 * query units, mirroring the stage's viewport-based scaling.
 */
export function SlideThumbnail(props: SlideThumbnailProps): React.JSX.Element {
  const { data, className } = props
  const style: React.CSSProperties = {
    ...CONTAINER_STYLE,
    background: slideBackgroundToCss(data.background),
  }

  return (
    <div className={className} style={style}>
      {data.elements.map((element) => (
        <SlideThumbnailElement key={element.id} element={element} />
      ))}
    </div>
  )
}
