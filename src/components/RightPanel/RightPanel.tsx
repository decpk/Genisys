import { useCallback, useEffect, useRef, useState } from 'react'

import { useAppShellId } from '@/components/AppShell/AppShellContext'
import { ResizablePanel } from '@/components/ResizablePanel'
import { registerRightPanelToggle } from '@/store/panel-toggle-registry'

import { rightPanelStyles } from './RightPanel.styles'
import type { RightPanelProps } from './RightPanel.types'

export function RightPanel(props: RightPanelProps): React.JSX.Element {
  const {
    appId,
    defaultWidth = 300,
    minWidth = 250,
    maxWidth = 500,
    forceCollapsed = false,
    defaultOpen = false,
    open,
    onOpenChange,
    children
  } = props

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = open ?? internalOpen

  const stateRef = useRef({ isOpen, onOpenChange, setInternalOpen, open })

  useEffect(() => {
    stateRef.current = { isOpen, onOpenChange, setInternalOpen, open }
  }, [isOpen, onOpenChange, open])

  const handleCollapseChange = useCallback(
    (collapsed: boolean) => {
      const next = !collapsed
      setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )

  const shellId = useAppShellId()
  const toggleId = shellId ?? appId

  useEffect(() => {
    return registerRightPanelToggle(toggleId, () => {
      const { isOpen: current, onOpenChange: onChange, setInternalOpen: setOpen, open: controlled } = stateRef.current
      const next = !current
      if (controlled !== undefined) {
        onChange?.(next)
      } else {
        setOpen(next)
        onChange?.(next)
      }
    })
  }, [toggleId])

  if (forceCollapsed) return null

  return (
    <ResizablePanel
      as="aside"
      defaultWidth={defaultWidth}
      minWidth={minWidth}
      maxWidth={maxWidth}
      collapsed={!isOpen}
      onCollapseChange={handleCollapseChange}
      position="right"
      className={rightPanelStyles.panel}
      expandTitle="Expand right panel"
      collapseTitle="Collapse right panel"
    >
      {isOpen ? children : null}
    </ResizablePanel>
  )
}
