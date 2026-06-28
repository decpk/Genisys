import { ImageOff } from 'lucide-react'

import { AppLoader } from '@/components/AppLoader'

import type { ClipboardImageHoverPreviewProps } from '../ClipboardImageHoverContent.types'

/**
 * Renders the image-area state machine (loading / error / image)
 * inside the hover popover. Fills its parent (`h-full`) so any image
 * aspect ratio is letterboxed uniformly via `object-contain`. Uses
 * early returns to avoid chained ternaries.
 */
export function ClipboardImageHoverPreview(
  props: ClipboardImageHoverPreviewProps
): React.JSX.Element {
  const { isLoading, hasError, dataUrl, alt } = props

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <AppLoader fullScreen={false} size={32} />
      </div>
    )
  }

  if (hasError || !dataUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 w-full h-full text-muted-foreground/60">
        <ImageOff size={32} strokeWidth={1.5} />
        <span className="text-xs">Preview unavailable</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-3">
      <img
        src={dataUrl}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-md drop-shadow-2xl"
      />
    </div>
  )
}
