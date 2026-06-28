import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

import { TerminalAutocompleteOverlay } from '../TerminalAutocompleteOverlay/TerminalAutocompleteOverlay'
import { acquireSurface, refitSurface, releaseSurface } from './terminalAppSurfacePool'

interface TerminalAppSurfaceProps {
  sessionId: string
  visible: boolean
}

/**
 * Thin React host for a pooled xterm surface. The actual terminal instance
 * lives in `terminalAppSurfacePool` (keyed by session id) so it survives
 * split/collapse remounts with its scrollback intact.
 */
export function TerminalAppSurface({ sessionId, visible }: TerminalAppSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    acquireSurface(sessionId, el)
    return () => releaseSurface(sessionId)
  }, [sessionId])

  useEffect(() => {
    if (visible) refitSurface(sessionId)
  }, [visible, sessionId])

  return (
    <div
      className={cn('absolute inset-0', visible ? '' : 'invisible pointer-events-none')}
    >
      <div ref={containerRef} className="absolute inset-0" />
      <TerminalAutocompleteOverlay sessionId={sessionId} visible={visible} />
    </div>
  )
}
