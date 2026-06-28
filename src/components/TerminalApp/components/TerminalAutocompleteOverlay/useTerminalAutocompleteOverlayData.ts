import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import type { IDisposable, Terminal as XTerm } from '@xterm/xterm'

import {
  acceptCommand,
  getSuggestion,
  setSelection,
  subscribeSuggestion,
  type SuggestionState,
} from '../../utils/terminalAutocompleteEngine'
import {
  focusSurface,
  getSurfaceTerm,
  hasContentBelowCursor,
  hasTextAfterCursor,
} from '../TerminalAppSurface/terminalAppSurfacePool'

/** Pixel placement of the suggestion overlay, relative to the overlay root. */
export interface OverlayPos {
  left: number
  top: number
  cellW: number
  cellH: number
  /** Render the dropdown above the caret (true) or below it (false). */
  dropUp: boolean
}

const EMPTY_SUGGESTION: SuggestionState = {
  input: '',
  ghost: '',
  ghostCommand: '',
  items: [],
  open: false,
  index: 0,
}

/**
 * Drives the autocomplete overlay for one terminal surface: tracks the engine's
 * suggestion state and computes where to paint the ghost text + dropdown by
 * reading the live xterm's cursor coordinates and cell metrics. Repositioning is
 * rAF-coalesced and re-runs on cursor move / render / scroll / resize.
 */
export function useTerminalAutocompleteOverlayData(sessionId: string, visible: boolean) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<XTerm | null>(null)
  const scheduleRef = useRef<() => void>(() => {})

  const [suggestion, setSuggestion] = useState<SuggestionState>(EMPTY_SUGGESTION)
  const [pos, setPos] = useState<OverlayPos | null>(null)
  const [ghostStyle, setGhostStyle] = useState<CSSProperties>({})
  // True when the shell already draws its own inline suggestion (e.g.
  // zsh-autosuggestions) — we hide our ghost so they don't overlap.
  const [ghostHidden, setGhostHidden] = useState(false)
  // True when the shell is drawing a completion menu below the prompt — we hide
  // our whole overlay so it doesn't stack on the shell's menu.
  const [menuBelow, setMenuBelow] = useState(false)

  useEffect(() => subscribeSuggestion(sessionId, setSuggestion), [sessionId])

  useEffect(() => {
    let disposed = false
    let rafAttach = 0
    let rafPos = 0
    const disposers: IDisposable[] = []

    const reposition = () => {
      const term = termRef.current
      const overlayEl = overlayRef.current
      if (!term || !overlayEl || !visible) {
        setPos(null)
        return
      }
      const screen = term.element?.querySelector('.xterm-screen') as HTMLElement | null
      const cols = term.cols
      const rows = term.rows
      if (!screen || !cols || !rows) {
        setPos(null)
        return
      }
      const screenRect = screen.getBoundingClientRect()
      const overlayRect = overlayEl.getBoundingClientRect()
      const cellW = screenRect.width / cols
      const cellH = screenRect.height / rows
      const buf = term.buffer.active
      const onScreenRow = buf.baseY + buf.cursorY - buf.viewportY
      if (onScreenRow < 0 || onScreenRow >= rows) {
        // Caret scrolled out of the viewport (user is reading scrollback).
        setPos(null)
        return
      }
      setPos({
        left: screenRect.left - overlayRect.left + buf.cursorX * cellW,
        top: screenRect.top - overlayRect.top + onScreenRow * cellH,
        cellW,
        cellH,
        dropUp: onScreenRow > rows * 0.6,
      })
      setGhostHidden(hasTextAfterCursor(term))
      setMenuBelow(hasContentBelowCursor(term))
      setGhostStyle({
        fontFamily: term.options.fontFamily,
        fontSize: `${term.options.fontSize ?? 13}px`,
        letterSpacing: `${term.options.letterSpacing ?? 0}px`,
        lineHeight: `${cellH}px`,
        height: `${cellH}px`,
        color: term.options.theme?.foreground ?? 'currentColor',
      })
    }

    const schedule = () => {
      if (rafPos) return
      rafPos = requestAnimationFrame(() => {
        rafPos = 0
        reposition()
      })
    }
    scheduleRef.current = schedule

    const attach = () => {
      if (disposed) return
      const term = getSurfaceTerm(sessionId)
      if (!term) {
        // The surface is created in the host's mount effect, which runs after
        // this child effect — retry on the next frame until it exists.
        rafAttach = requestAnimationFrame(attach)
        return
      }
      termRef.current = term
      disposers.push(
        term.onCursorMove(schedule),
        term.onRender(schedule),
        term.onScroll(schedule),
        term.onResize(schedule),
      )
      schedule()
    }
    attach()

    return () => {
      disposed = true
      if (rafAttach) cancelAnimationFrame(rafAttach)
      if (rafPos) cancelAnimationFrame(rafPos)
      disposers.forEach((d) => {
        try {
          d.dispose()
        } catch {
          /* noop */
        }
      })
      termRef.current = null
    }
  }, [sessionId, visible])

  // Re-place when the suggestion changes (e.g. dropdown opened / list re-ranked).
  useEffect(() => {
    scheduleRef.current()
  }, [suggestion])

  const onAcceptMatch = useCallback(
    (index: number) => {
      const item = getSuggestion(sessionId).items[index]
      if (!item) return
      acceptCommand(sessionId, item.value)
      focusSurface(sessionId)
    },
    [sessionId],
  )

  const onHoverMatch = useCallback(
    (index: number) => setSelection(sessionId, index),
    [sessionId],
  )

  return { overlayRef, suggestion, pos, ghostStyle, ghostHidden, menuBelow, onAcceptMatch, onHoverMatch }
}
