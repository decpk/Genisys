import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'

import { imageLightboxStyles as s } from './ImageLightbox.styles'
import type { ImageLightboxProps } from './ImageLightbox.types'

export function ImageLightbox(props: ImageLightboxProps): React.JSX.Element {
  const { src, fileName, alt, onLoad } = props

  let caption: React.JSX.Element | null = null
  if (fileName) {
    caption = <span className={s.caption}>{fileName}</span>
  }

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger className={s.trigger}>
        <img src={src} alt={alt} className={s.thumb} onLoad={onLoad} />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={s.overlay} />
        <DialogPrimitive.Content className={s.content}>
          <DialogPrimitive.Title className="sr-only">
            {alt}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className={s.close} aria-label="Close">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
          <img src={src} alt={alt} className={s.full} />
          {caption}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
