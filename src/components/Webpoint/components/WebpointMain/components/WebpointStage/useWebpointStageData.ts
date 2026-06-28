import { useEffect, useRef, useState } from 'react'

import { compileSlideToHtml } from '@/lib/webpoint/compileSlideToHtml'
import type { Slide } from '@/store/webpoint-store/types'

type SlotKey = 'a' | 'b'

/**
 * Drives the stage's two persistent, sandboxed iframes. Each slide compiles to
 * a self-contained HTML document that is rendered directly via the iframe's
 * `srcdoc`; once the hidden ("back") buffer loads it crossfades to the front.
 * Buffers never unmount, so navigating between slides never flashes a reload.
 *
 * `srcdoc` is used instead of a custom `webpoint://` scheme because macOS
 * WKWebView does not honor a custom URI scheme loaded into a sandboxed
 * (opaque-origin) iframe, which left the slide stage rendering a black frame.
 */
export function useWebpointStageData(slide: Slide | null) {
  const [docA, setDocA] = useState<string | null>(null)
  const [docB, setDocB] = useState<string | null>(null)
  const [front, setFront] = useState<SlotKey>('a')
  const [fadeMs, setFadeMs] = useState(400)
  const frontRef = useRef<SlotKey>('a')
  const pendingRef = useRef<SlotKey | null>(null)
  const seqRef = useRef(0)
  frontRef.current = front

  useEffect(() => {
    if (!slide) return
    const back: SlotKey = frontRef.current === 'a' ? 'b' : 'a'
    // A per-load nonce guarantees the back buffer's `srcdoc` string always
    // differs, so the iframe reloads (and fires `onLoad`) even when navigating
    // back to a slide whose compiled HTML is identical to what that buffer
    // last held (e.g. pressing Prev).
    const nonce = ++seqRef.current
    const html = compileSlideToHtml(slide.data).replace(
      '</head>',
      `<!--genisys-slide:${nonce}--></head>`,
    )
    setFadeMs(slide.data.transition === 'none' ? 0 : 400)
    pendingRef.current = back
    if (back === 'a') setDocA(html)
    else setDocB(html)
    // Re-run when the active slide identity or its content version changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.id, slide?.updatedAt])

  const handleLoad = (slot: SlotKey) => () => {
    if (pendingRef.current === slot) {
      pendingRef.current = null
      setFront(slot)
    }
  }

  return { docA, docB, front, fadeMs, onLoadA: handleLoad('a'), onLoadB: handleLoad('b') }
}
