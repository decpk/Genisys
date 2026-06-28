import { useCallback, useLayoutEffect, useRef } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { setSurfaceResizeSuppressed } from '../../TerminalAppSurface/terminalAppSurfacePool'
import { clampGitPanelWidth } from '../utils/clampGitPanelWidth'

/**
 * Drag-to-resize for the git panel, given its element ref. Width is DOM-owned:
 * applied once on mount (layout effect) and then written straight to the panel
 * element on every pointer-move — no React state (which re-rendered the subtree
 * and lagged) and no `requestAnimationFrame` (which deferred the write by a
 * frame, so the edge trailed the cursor and the panel settled a frame behind
 * where you released — the "inaccurate drop"). The move handler only reads the
 * event and writes `style.width`, never reads layout, so the browser still lays
 * out once per paint (no thrash). Pointer capture keeps moves arriving even when
 * the cursor passes over the xterm surface. Persists to the global setting on
 * pointer-up. Returns the drag handle's pointer-down handler.
 */
export function useTerminalGitPanelResize(
  panelRef: React.RefObject<HTMLElement | null>,
): (e: React.PointerEvent) => void {
  const persist = useSettingsStore((s) => s.setTerminalGitPanelWidth)
  const widthRef = useRef(
    clampGitPanelWidth(useSettingsStore.getState().terminalGitPanelWidth),
  )

  // Apply the initial width once (pre-paint). Thereafter the DOM owns the width.
  useLayoutEffect(() => {
    const el = panelRef.current
    if (el) el.style.width = `${widthRef.current}px`
  }, [panelRef])

  return useCallback(
    (e: React.PointerEvent) => {
      const el = panelRef.current
      if (!el) return
      e.preventDefault()
      const handle = e.currentTarget
      const pointerId = e.pointerId
      const startX = e.clientX
      const startWidth = widthRef.current
      // Capture the pointer so moves keep arriving even when the cursor passes
      // over the xterm surface (whose own handlers would otherwise become the
      // event target). Best-effort — the window listeners below are the safety net.
      try {
        handle.setPointerCapture(pointerId)
      } catch {
        /* capture unsupported / pointer already gone — ignore */
      }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      // Pause terminal refits for the duration of the drag — otherwise the
      // squeezed terminal reflows its scrollback + pushes a PTY resize every
      // frame, which lags the drag. Resumed (and re-fit once) on pointer-up.
      setSurfaceResizeSuppressed(true)

      const onMove = (ev: PointerEvent) => {
        // Panel is right-docked: dragging the left edge leftwards widens it.
        // Write straight to the DOM (no rAF) so the edge tracks the cursor with
        // sub-frame latency and the panel is exactly where the pointer is on
        // release.
        const next = clampGitPanelWidth(startWidth + (startX - ev.clientX))
        widthRef.current = next
        el.style.width = `${next}px`
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        try {
          handle.releasePointerCapture(pointerId)
        } catch {
          /* already released — ignore */
        }
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        setSurfaceResizeSuppressed(false)
        persist(widthRef.current)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [persist, panelRef],
  )
}
