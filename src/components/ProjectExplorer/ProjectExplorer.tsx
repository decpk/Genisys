import { AppShell } from '@/components/AppShell'
import { RightPanel } from '@/components/RightPanel'
import { RepoHistory } from './components/RepoHistory'
import { ExplorerPane } from './components/ExplorerPane'
import { ExplorerAIPanel } from './components/ExplorerAIPanel'
import { SelectorPaneToolbar } from './components/SelectorPaneToolbar'
import { NoFolderSelectedState } from './components/NoFolderSelectedState'
import { SplitPaneEmptyState } from './components/SplitPaneEmptyState'
import { useProjectExplorerData } from './hooks/useProjectExplorerData'
import { useReportExplorerBusy } from './hooks/useReportExplorerBusy'

export function ProjectExplorer(): React.JSX.Element {
  // Protect Explorer from keep-alive LRU eviction while any Explorer AI session
  // is streaming a command (reads per-session status from the history store).
  useReportExplorerBusy()

  const {
    panes,
    activePanePath,
    refreshFn,
    aiPanelOpen,
    setAiPanelOpen,
    droppedFile,
    setDroppedFile,
    isDragOver,
    isLocalRepo,
    toggleAIPanel,
    handleSelectRepo,
    handleSplitSelectRepo,
    handleSplit,
    handleClosePane,
    handleActivePathChange,
    handleRefreshReady,
  } = useProjectExplorerData()

  return (
    <AppShell
      appId="explorer"
      sidebar={
        <div className="flex flex-col h-full bg-card/80 backdrop-blur-xl">
          <RepoHistory onSelect={handleSelectRepo} activePanes={panes} />
        </div>
      }
      rightPanel={
        isLocalRepo && activePanePath ? (
          <RightPanel
            appId="explorer"
            defaultWidth={280}
            minWidth={280}
            maxWidth={700}
            open={aiPanelOpen}
            onOpenChange={setAiPanelOpen}
          >
            <ExplorerAIPanel
              rootPath={activePanePath.rootPath}
              currentPath={activePanePath.currentPath}
              onRefresh={refreshFn ?? (() => {})}
              droppedFile={droppedFile}
              onClearDroppedFile={() => setDroppedFile(null)}
            />
          </RightPanel>
        ) : undefined
      }
    >
      <div className="flex-1 min-w-0 h-full relative select-none">
        {panes.length === 0 ? (
          <NoFolderSelectedState />
        ) : (
          <div className="flex h-full overflow-x-auto">
            {panes.map((pane) =>
              pane.repoInfo ? (
                <ExplorerPane
                  key={pane.id}
                  repoInfo={pane.repoInfo}
                  onSplit={handleSplit}
                  onClose={() => handleClosePane(pane.id)}
                  onActivePathChange={handleActivePathChange}
                  onRefreshReady={handleRefreshReady}
                  onToggleAIPanel={toggleAIPanel}
                />
              ) : (
                <div
                  key={pane.id}
                  className="flex flex-col h-full flex-1 overflow-hidden border-r border-border/20 last:border-r-0"
                >
                  <SelectorPaneToolbar
                    onClose={() => handleClosePane(pane.id)}
                  />
                  <SplitPaneEmptyState
                    onSelect={(repo) => handleSplitSelectRepo(pane.id, repo)}
                    activePanes={panes}
                  />
                </div>
              ),
            )}
          </div>
        )}
        {isDragOver && (
          <div className="absolute inset-0 z-20 bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl pointer-events-none flex items-center justify-center">
            <div className="text-sm text-primary font-medium">
              Drop file to target with AI
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
