import { Plus } from 'lucide-react'
import { memo, useCallback } from 'react'

import { cn } from '@/lib/utils'
import { terminalStyles } from '@/components/Terminal/Terminal.styles'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import { useTerminalGitPanelStore } from '@/store/terminal-git-panel-store'
import type { TermLeaf } from '@/store/terminal-app-store/types'

import { terminalAppStyles } from '../../TerminalApp.styles'
import { TerminalAppSurface } from '../TerminalAppSurface/TerminalAppSurface'
import { TerminalDiffOverlay } from '../TerminalDiffOverlay'
import { TerminalGitPanel } from '../TerminalGitPanel'
import { TerminalPaneDropZones } from '../TerminalPaneDropZones/TerminalPaneDropZones'
import { TerminalAppPaneTabs } from './TerminalAppPaneTabs'

interface Props {
  leaf: TermLeaf
}

function PaneEmpty({ leafId }: { leafId: string }) {
  const createTab = useTerminalAppStore((s) => s.createTab)
  return (
    <div className={terminalStyles.empty}>
      <button
        type="button"
        className={terminalStyles.emptyButton}
        onClick={() => void createTab({ groupId: leafId })}
      >
        <Plus className="w-3.5 h-3.5" /> New terminal
      </button>
    </div>
  )
}

/** A leaf pane: its own tab strip plus the stacked (visibility-toggled) surfaces. */
export const TerminalAppPane = memo(function TerminalAppPane({ leaf }: Props) {
  const setActiveGroup = useTerminalAppStore((s) => s.setActiveGroup)
  const isActive = useTerminalAppStore((s) => s.activeGroupId === leaf.id)
  // The active-pane focus ring only matters when the view is split into multiple
  // panes. With a single pane it just draws a 1px line across the top of the tab
  // bar, so suppress it unless there's an actual split.
  const isSplit = useTerminalAppStore((s) => s.tree.kind === 'split')
  const gitPanelVisible = useTerminalGitPanelStore((s) => s.visibleByLeaf[leaf.id] ?? false)

  const onPointerDownCapture = useCallback(() => {
    setActiveGroup(leaf.id)
  }, [setActiveGroup, leaf.id])

  const hasTabs = leaf.tabs.length > 0
  const activeTab = leaf.tabs.find((t) => t.id === leaf.activeTabId)
  const cwd = activeTab?.cwd ?? null
  const showGitPanel = gitPanelVisible && hasTabs

  let surfaces
  if (!hasTabs) {
    surfaces = <PaneEmpty leafId={leaf.id} />
  } else {
    surfaces = leaf.tabs.map((t) => (
      <TerminalAppSurface
        key={t.id}
        sessionId={t.id}
        visible={t.id === leaf.activeTabId}
      />
    ))
  }

  return (
    <div
      className={cn(
        terminalAppStyles.pane,
        isActive && isSplit ? terminalAppStyles.paneActive : '',
      )}
      onPointerDownCapture={onPointerDownCapture}
    >
      {hasTabs && <TerminalAppPaneTabs leaf={leaf} />}
      <div className={terminalAppStyles.paneBody}>
        <div className={terminalAppStyles.paneSurfaces}>
          {surfaces}
          <TerminalPaneDropZones groupId={leaf.id} />
          <TerminalDiffOverlay leafId={leaf.id} />
        </div>
        {showGitPanel && <TerminalGitPanel leafId={leaf.id} cwd={cwd} />}
      </div>
    </div>
  )
})
