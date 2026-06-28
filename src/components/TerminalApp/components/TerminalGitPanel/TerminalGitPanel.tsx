import { useRef } from 'react'

import { TerminalGitPanelBody } from './components/TerminalGitPanelBody'
import { TerminalGitPanelHeader } from './components/TerminalGitPanelHeader'
import { useTerminalGitPanelData } from './hooks/useTerminalGitPanelData'
import { useTerminalGitPanelResize } from './hooks/useTerminalGitPanelResize'
import { terminalGitPanelStyles as s } from './TerminalGitPanel.styles'
import type { TerminalGitPanelProps } from './TerminalGitPanel.types'

/**
 * Git changes panel docked to the right edge of a terminal pane. Shows live
 * `git status` for the pane's active-tab folder, with a draggable width and a
 * clickable file list that opens a diff overlay. Mounting/visibility is owned
 * by the parent pane (per-pane `useTerminalGitPanelStore`).
 */
export function TerminalGitPanel(props: TerminalGitPanelProps) {
  const { leafId, cwd } = props
  const data = useTerminalGitPanelData(leafId, cwd)
  const panelRef = useRef<HTMLElement | null>(null)
  const onResizeStart = useTerminalGitPanelResize(panelRef)

  return (
    <aside ref={panelRef} className={s.panel}>
      <div
        className={s.resizeHandle}
        onPointerDown={onResizeStart}
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize"
      >
        <div className={s.resizeHandleLine} />
      </div>
      <TerminalGitPanelHeader
        title={data.title}
        count={data.count}
        isLoading={data.isLoading}
        onRefresh={data.onRefresh}
        onClose={data.onClose}
      />
      <div className={s.body}>
        <TerminalGitPanelBody data={data} />
      </div>
    </aside>
  )
}
