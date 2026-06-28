import '@xterm/xterm/css/xterm.css'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import { TerminalDockHandle } from './components/TerminalDockHandle'
import { TerminalEmpty } from './components/TerminalEmpty'
import { TerminalHeader } from './components/TerminalHeader'
import { TerminalSurface } from './components/TerminalSurface'
import { useTerminalAutoCreate } from './hooks/useTerminalAutoCreate'
import { useTerminalData } from './hooks/useTerminalData'
import { useTerminalEventBridge } from './hooks/useTerminalEventBridge'
import { terminalStyles } from './Terminal.styles'
import type { TerminalProps } from './Terminal.types'

export function Terminal(props: TerminalProps) {
  // global wiring (mounted once at root)
  useTerminalEventBridge()
  useTerminalAutoCreate()

  const data = useTerminalData()

  // Render rules (avoid JSX ternaries — precompute):
  // - !open && no sessions  → render nothing
  // - !open && has sessions → keep mounted, hide via height:0 to preserve xterm state
  // - open                  → normal docked panel (or maximized)
  const shouldUnmount = !data.open && !data.hasSessions
  const isHidden = !data.open && data.hasSessions

  const heightStyle = useMemo<React.CSSProperties>(() => {
    if (isHidden) return { height: 0, minHeight: 0, overflow: 'hidden' }
    if (data.maximized) return { flex: '1 1 auto', minHeight: 0, height: 'auto' }
    return { height: data.height }
  }, [isHidden, data.maximized, data.height])

  if (shouldUnmount) return null

  // Body content: empty state vs. all session surfaces (kept mounted, visibility toggled)
  let body: React.ReactNode
  if (!data.hasSessions) {
    body = <TerminalEmpty />
  } else {
    body = data.sessions.map((s) => (
      <TerminalSurface key={s.id} sessionId={s.id} visible={s.id === data.activeId} />
    ))
  }

  return (
    <div
      className={cn(terminalStyles.root, isHidden ? terminalStyles.rootHidden : '', props.className)}
      style={heightStyle}
      data-terminal-panel
    >
      <TerminalDockHandle />
      <TerminalHeader />
      <div className={terminalStyles.body}>{body}</div>
    </div>
  )
}
