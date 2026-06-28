import { useEffect, useRef } from 'react'

import { useTerminalStore } from '@/store/terminal-store'

/** When the terminal panel is opened with no live sessions, auto-create one. */
export function useTerminalAutoCreate(): void {
  const open = useTerminalStore((s) => s.open)
  const sessionsLen = useTerminalStore((s) => s.sessions.length)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!open) return
    if (sessionsLen > 0) return
    if (inFlight.current) return
    inFlight.current = true
    useTerminalStore
      .getState()
      .createSession()
      .finally(() => {
        inFlight.current = false
      })
  }, [open, sessionsLen])
}
