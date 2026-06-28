import { buildElementStyles } from '@/lib/webpoint/buildElementStyles'

import type { SlideThumbnailElementProps } from './SlideThumbnailElement.types'

export function SlideThumbnailElement(props: SlideThumbnailElementProps): React.JSX.Element {
  const { element } = props
  // Animations are skipped in thumbnails; the layout map doubles as a React style.
  const style = buildElementStyles(element, 'cqw', false) as unknown as React.CSSProperties

  if (element.type === 'image') {
    const objectFit = element.style.objectFit ?? 'cover'
    return (
      <div style={style}>
        <img
          src={element.src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit, display: 'block' }}
        />
      </div>
    )
  }

  if (element.type === 'text') {
    return <div style={style}>{element.content}</div>
  }

  return <div style={style} />
}
