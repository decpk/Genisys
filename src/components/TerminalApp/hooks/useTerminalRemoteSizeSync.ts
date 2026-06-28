import { useEffect } from 'react'

import { onRemoteMirrorSize } from '@/components/Terminal/api/remote'

import {
  clearRemoteControlledSize,
  setRemoteControlledSize,
} from '../components/TerminalAppSurface/terminalAppSurfacePool'

/**
 * Min-size negotiation for a tab a phone is mirroring. A single PTY has one
 * size, so two differently-sized viewers can't both render at full size; instead
 * the shared PTY is sized to min(phone viewport, desktop container) — the
 * tmux-style "smallest attached client wins". When a phone attaches to (or
 * resizes) a mirrored tab the backend reports the phone's viewport with
 * `controlled: true`; this clamps the desktop xterm + the PTY to the min so
 * neither end is clipped (the larger end just letterboxes) and `\r` redraws line
 * up on both. On release (`controlled: false`) the desktop re-fits to its own
 * container and reclaims its full size.
 */
export function useTerminalRemoteSizeSync(): void {
  useEffect(() => {
    const off = onRemoteMirrorSize(({ sessionId, cols, rows, controlled }) => {
      if (controlled) setRemoteControlledSize(sessionId, cols, rows)
      else clearRemoteControlledSize(sessionId)
    })
    return off
  }, [])
}
