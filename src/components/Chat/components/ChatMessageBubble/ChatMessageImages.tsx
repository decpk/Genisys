import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'

interface ChatMessageImagesProps {
  /** Stored chat-image filenames (e.g. `["<uuid>.png"]`). */
  filenames: string[]
}

interface LoadedImage {
  filename: string
  dataUrl: string | null
}

/**
 * Renders a thumbnail grid for images attached to a user message. Each image
 * is lazy-loaded from disk via `window.api.getChatImage(filename)` and shown
 * as a base64 data URI. Clicking a thumbnail opens an in-app lightbox preview
 * with keyboard navigation (Esc to close, ←/→ to switch images).
 */
export function ChatMessageImages({
  filenames,
}: ChatMessageImagesProps): React.JSX.Element | null {
  const [loaded, setLoaded] = useState<LoadedImage[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoaded(filenames.map((filename) => ({ filename, dataUrl: null })))

    void (async () => {
      const results = await Promise.all(
        filenames.map(async (filename) => {
          try {
            const res = await window.api.getChatImage(filename)
            return {
              filename,
              dataUrl: res?.success ? res.dataUrl ?? null : null,
            }
          } catch {
            return { filename, dataUrl: null }
          }
        }),
      )
      if (!cancelled) setLoaded(results)
    })()

    return () => {
      cancelled = true
    }
  }, [filenames])

  // Only images that successfully loaded are previewable.
  const previewable = useMemo(
    () => loaded.filter((img): img is LoadedImage & { dataUrl: string } => !!img.dataUrl),
    [loaded],
  )

  if (filenames.length === 0) return null

  return (
    <>
      <div className="mb-2 flex flex-wrap gap-2">
        {loaded.map((img) => (
          <div
            key={img.filename}
            className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-secondary/30"
          >
            {img.dataUrl ? (
              <img
                src={img.dataUrl}
                alt="attachment"
                className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
                onClick={() => {
                  const idx = previewable.findIndex(
                    (p) => p.filename === img.filename,
                  )
                  if (idx >= 0) setPreviewIndex(idx)
                }}
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-muted" />
            )}
          </div>
        ))}
      </div>

      {previewIndex !== null && previewable.length > 0 && (
        <ChatImageLightbox
          images={previewable.map((p) => p.dataUrl)}
          startIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  )
}

interface ChatImageLightboxProps {
  images: string[]
  startIndex: number
  onClose: () => void
}

/**
 * Full-screen image preview overlay rendered into a portal. Reuses the shared
 * `.lightbox-*` styles. Supports Esc to close and ←/→ to navigate when there
 * is more than one image.
 */
function ChatImageLightbox({
  images,
  startIndex,
  onClose,
}: ChatImageLightboxProps): React.JSX.Element {
  const [current, setCurrent] = useState(
    Math.min(Math.max(startIndex, 0), images.length - 1),
  )

  const goPrev = useCallback(() => {
    setCurrent((c) => (c <= 0 ? images.length - 1 : c - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setCurrent((c) => (c >= images.length - 1 ? 0 : c + 1))
  }, [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        // Consume Escape so closing the lightbox doesn't also exit native fullscreen.
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, goPrev, goNext])

  const overlay = (
    <div className="lightbox-overlay" onClick={onClose}>
      <Tooltip content="Close" side="bottom">
        <button className="lightbox-close" onClick={onClose}>
          <X size={24} />
        </button>
      </Tooltip>

      {images.length > 1 && (
        <Tooltip content="Previous image" side="right">
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
          >
            <ChevronLeft size={28} />
          </button>
        </Tooltip>
      )}

      <img
        src={images[current]}
        alt=""
        className="lightbox-image"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <Tooltip content="Next image" side="left">
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
          >
            <ChevronRight size={28} />
          </button>
        </Tooltip>
      )}

      {images.length > 1 && (
        <span className="lightbox-counter">
          {current + 1} / {images.length}
        </span>
      )}
    </div>
  )

  return createPortal(overlay, document.body)
}
