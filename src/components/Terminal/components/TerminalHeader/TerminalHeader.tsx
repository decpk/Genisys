import { Maximize2, Minimize2, Trash2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import { terminalStyles } from '../../Terminal.styles'
import type { TerminalHeaderProps } from '../../Terminal.types'
import { useTerminalData } from '../../hooks/useTerminalData'
import { TerminalTabBar } from '../TerminalTabBar'

export function TerminalHeader(props: TerminalHeaderProps) {
  const data = useTerminalData()

  function onKillActive() {
    if (data.activeId) data.closeSession(data.activeId)
  }
  function onToggleMax() {
    data.setMaximized(!data.maximized)
  }
  function onClose() {
    data.setOpen(false)
  }

  const MaxIcon = data.maximized ? Minimize2 : Maximize2
  const maxLabel = data.maximized ? 'Restore terminal panel' : 'Maximize terminal panel'

  return (
    <div className={cn(terminalStyles.header, props.className)}>
      <TerminalTabBar />

      <div className={terminalStyles.toolbar}>
        <Tooltip content="Kill active terminal">
          <button
            type="button"
            className={terminalStyles.toolbarBtn}
            onClick={onKillActive}
            aria-label="Kill active terminal"
            disabled={!data.activeId}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </Tooltip>
        <Tooltip content={maxLabel}>
          <button
            type="button"
            className={terminalStyles.toolbarBtn}
            onClick={onToggleMax}
            aria-label={maxLabel}
          >
            <MaxIcon className="w-3 h-3" />
          </button>
        </Tooltip>
        <Tooltip content="Hide terminal panel" shortcut="⌘ `">
          <button
            type="button"
            className={terminalStyles.toolbarBtn}
            onClick={onClose}
            aria-label="Hide terminal panel"
          >
            <X className="w-3 h-3" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
