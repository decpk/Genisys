import { Plus } from 'lucide-react'

import { useTerminalStore } from '@/store/terminal-store'

import { cn } from '@/lib/utils'

import { terminalStyles } from '../../Terminal.styles'
import type { TerminalEmptyProps } from '../../Terminal.types'

export function TerminalEmpty(props: TerminalEmptyProps) {
  function onCreate() {
    useTerminalStore.getState().createSession()
  }
  return (
    <div className={cn(terminalStyles.empty, props.className)}>
      <span>No active terminal sessions</span>
      <button type="button" className={terminalStyles.emptyButton} onClick={onCreate}>
        <Plus className="w-3.5 h-3.5" />
        New terminal
      </button>
    </div>
  )
}
