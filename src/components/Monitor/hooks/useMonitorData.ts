import { useCallback, useEffect, useRef } from 'react'

import { useMonitorStore } from '@/store/monitor-store'

import { monitorController } from '../engine/monitorController'
import {
  startMonitorSession,
  stopMonitorSession,
} from '../engine/monitorSession'

/**
 * Data hook for the Monitor app shell. Exposes the live status, the local
 * preview `<video>` ref (bound to the captured stream while streaming), and the
 * start/stop/share actions. Live media stays in `monitorController`, never in
 * React state.
 */
export function useMonitorData() {
  const running = useMonitorStore((s) => s.running)
  const busy = useMonitorStore((s) => s.busy)
  const error = useMonitorStore((s) => s.error)
  const viewerCount = useMonitorStore((s) => s.clients.length)
  const openPanel = useMonitorStore((s) => s.openPanel)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Bind the local preview to the captured stream while streaming. The element
  // is always mounted (the idle CTA overlays it), so the ref is stable.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.srcObject = running ? monitorController.getPreviewStream() : null
    if (running) {
      const p = el.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    }
  }, [running])

  const start = useCallback(() => {
    void startMonitorSession()
  }, [])

  const stop = useCallback(() => {
    void stopMonitorSession()
  }, [])

  return { running, busy, error, viewerCount, videoRef, start, stop, openPanel }
}
