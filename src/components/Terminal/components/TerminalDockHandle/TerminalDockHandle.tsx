import { useEffect, useRef } from 'react'

import { useTerminalStore } from '@/store/terminal-store'

import { cn } from '@/lib/utils'

import { terminalStyles } from '../../Terminal.styles'
import type { TerminalDockHandleProps } from '../../Terminal.types'

export function TerminalDockHandle(props: TerminalDockHandleProps) {
  const draggingRef = useRef(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    draggingRef.current = true
    startYRef.current = e.clientY
    startHeightRef.current = useTerminalStore.getState().height
    document.body.style.cursor = 'row-resize'
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current) return
      const delta = startYRef.current - e.clientY
      useTerminalStore.getState().setHeight(startHeightRef.current + delta)
    }
    function onUp() {
      if (!draggingRef.current) return
      draggingRef.current = false
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div
      className={cn(terminalStyles.dockHandle, props.className)}
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize terminal panel"
    />
  )
}
