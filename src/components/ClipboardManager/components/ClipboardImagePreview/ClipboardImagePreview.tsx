import { ImageOff } from 'lucide-react'

import { useClipboardImagePreviewData } from './useClipboardImagePreviewData'

import type { ClipboardImagePreviewProps } from './ClipboardImagePreview.types'

export function ClipboardImagePreview(props: ClipboardImagePreviewProps): React.JSX.Element {
  const { item } = props
  const { ref, dataUrl, error } = useClipboardImagePreviewData(item)

  let content: React.JSX.Element
  if (error) {
    content = (
      <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground/60">
        <ImageOff size={18} strokeWidth={1.5} />
        <span className="text-[11px]">Image unavailable</span>
      </div>
    )
  } else if (dataUrl) {
    content = (
      <img
        src={dataUrl}
        alt="Clipboard image"
        className="max-h-[180px] w-auto object-contain"
        loading="lazy"
      />
    )
  } else {
    content = (
      <div className="flex items-center justify-center py-8">
        <div className="flex gap-1">
          <div className="size-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
          <div className="size-1.5 rounded-full bg-muted-foreground/30 animate-pulse [animation-delay:150ms]" />
          <div className="size-1.5 rounded-full bg-muted-foreground/30 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="mt-1.5 rounded-lg overflow-hidden bg-muted/20 ring-1 ring-border/20 min-h-[100px] flex items-center justify-center"
    >
      {content}
    </div>
  )
}
