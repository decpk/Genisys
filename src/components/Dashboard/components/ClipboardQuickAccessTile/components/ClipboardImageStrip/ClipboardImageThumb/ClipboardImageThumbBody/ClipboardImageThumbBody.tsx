import { ImageOff } from 'lucide-react'

import type { ClipboardImageThumbBodyProps } from './ClipboardImageThumbBody.types'

/**
 * Three-state renderer for the thumbnail tile body — error glyph,
 * loaded `<img>`, or three pulsing dots while the bytes load. Uses
 * early returns to avoid chained ternaries inside JSX.
 */
export function ClipboardImageThumbBody(
  props: ClipboardImageThumbBodyProps
): React.JSX.Element {
  const { dataUrl, hasError, alt } = props

  if (hasError) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground/60">
        <ImageOff size={18} strokeWidth={1.5} />
      </div>
    )
  }

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex gap-0.5">
        <div className="size-1 rounded-full bg-muted-foreground/30 animate-pulse" />
        <div className="size-1 rounded-full bg-muted-foreground/30 animate-pulse [animation-delay:150ms]" />
        <div className="size-1 rounded-full bg-muted-foreground/30 animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  )
}
