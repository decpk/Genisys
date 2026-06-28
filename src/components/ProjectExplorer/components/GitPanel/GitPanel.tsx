import { useCallback, useState } from 'react'
import { GitBranch, X } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResizablePanel } from '@/components/ResizablePanel'
import { CurrentChanges } from './components/CurrentChanges'
import { GitHistory } from './components/GitHistory'
import { Worktrees } from './components/Worktrees'
import {
  GIT_PANEL_MIN_WIDTH,
  GIT_PANEL_MAX_WIDTH,
  GIT_PANEL_DEFAULT_WIDTH
} from './GitPanel.constants'
import type { GitPanelProps } from './GitPanel.types'

type GitTab = 'changes' | 'history' | 'worktrees'

export function GitPanel({ rootPath, isOpen, onClose }: GitPanelProps): React.JSX.Element | null {
  const [activeTab, setActiveTab] = useState<GitTab>('changes')
  const [loadedTabs, setLoadedTabs] = useState<Record<GitTab, boolean>>({
    changes: true,
    history: false,
    worktrees: false
  })

  const handleTabChange = useCallback((tab: string) => {
    const t = tab as GitTab
    setActiveTab(t)
    setLoadedTabs((prev) => ({ ...prev, [t]: true }))
  }, [])

  if (!isOpen) return null

  return (
    <ResizablePanel
      as="aside"
      defaultWidth={GIT_PANEL_DEFAULT_WIDTH}
      minWidth={GIT_PANEL_MIN_WIDTH}
      maxWidth={GIT_PANEL_MAX_WIDTH}
      position="right"
      className="h-full bg-card"
      expandTitle="Expand git panel"
      collapseTitle="Collapse git panel"
    >
      <div className="flex items-center gap-2 px-3 h-12 border-b border-border/40 shrink-0">
        <GitBranch size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">Git</span>
        <div className="ml-auto">
          <Tooltip content="Close git panel" side="left">
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col flex-1 min-h-0"
      >
        <TabsList className="px-1 shrink-0">
          <TabsTrigger value="changes" className="text-[11px]">
            Changes
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[11px]">
            History
          </TabsTrigger>
          <TabsTrigger value="worktrees" className="text-[11px]">
            Worktrees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="flex-1 overflow-y-auto mt-0 pb-6">
          <CurrentChanges rootPath={rootPath} />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-y-auto mt-0 pb-6">
          {loadedTabs.history && <GitHistory rootPath={rootPath} />}
        </TabsContent>

        <TabsContent value="worktrees" className="flex-1 overflow-y-auto mt-0 pb-6">
          {loadedTabs.worktrees && <Worktrees rootPath={rootPath} />}
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  )
}
