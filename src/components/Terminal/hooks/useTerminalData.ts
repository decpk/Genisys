import { useMemo } from 'react'

import { useTerminalStore } from '@/store/terminal-store'

/** Subscribe to terminal-store state needed by `Terminal.tsx`. Selects
 *  primitives + the sessions array reference (which only changes on real
 *  mutation), then composes a stable view via useMemo. */
export function useTerminalData() {
  const sessions = useTerminalStore((s) => s.sessions)
  const activeId = useTerminalStore((s) => s.activeId)
  const open = useTerminalStore((s) => s.open)
  const height = useTerminalStore((s) => s.height)
  const maximized = useTerminalStore((s) => s.maximized)

  const createSession = useTerminalStore((s) => s.createSession)
  const closeSession = useTerminalStore((s) => s.closeSession)
  const setActiveSession = useTerminalStore((s) => s.setActiveSession)
  const setOpen = useTerminalStore((s) => s.setOpen)
  const toggleOpen = useTerminalStore((s) => s.toggleOpen)
  const setHeight = useTerminalStore((s) => s.setHeight)
  const setMaximized = useTerminalStore((s) => s.setMaximized)

  return useMemo(
    () => ({
      sessions,
      activeId,
      open,
      height,
      maximized,
      hasSessions: sessions.length > 0,
      createSession,
      closeSession,
      setActiveSession,
      setOpen,
      toggleOpen,
      setHeight,
      setMaximized,
    }),
    [
      sessions,
      activeId,
      open,
      height,
      maximized,
      createSession,
      closeSession,
      setActiveSession,
      setOpen,
      toggleOpen,
      setHeight,
      setMaximized,
    ]
  )
}
