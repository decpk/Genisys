import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import { terminalStyles } from '../../Terminal.styles'
import type { TerminalTabBarProps } from '../../Terminal.types'
import { useTerminalData } from '../../hooks/useTerminalData'
import { TerminalTab } from '../TerminalTab'

export function TerminalTabBar(props: TerminalTabBarProps) {
  const data = useTerminalData()

  function onNew() {
    data.createSession()
  }

  return (
    <div className={cn(terminalStyles.tabBar, props.className)} role="tablist">
      {data.sessions.map((s) => (
        <TerminalTab
          key={s.id}
          id={s.id}
          title={s.title}
          active={s.id === data.activeId}
          exited={s.exited}
          exitCode={s.exitCode}
          onActivate={data.setActiveSession}
          onClose={data.closeSession}
        />
      ))}
      <Tooltip content="New terminal">
        <button
          type="button"
          className={terminalStyles.newTabBtn}
          onClick={onNew}
          aria-label="New terminal"
        >
          <Plus className="w-3 h-3" />
        </button>
      </Tooltip>
    </div>
  );
}
