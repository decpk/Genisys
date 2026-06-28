import { useMemo } from 'react'

import { useExplorerAIPanel } from './useExplorerAIPanel'
import { useExplorerDragDrop } from './useExplorerDragDrop'
import { useExplorerPanes } from './useExplorerPanes'

export function useProjectExplorerData() {
  const {
    aiPanelOpen,
    setAiPanelOpen,
    activePanePath,
    refreshFn,
    isLocalRepo,
    toggleAIPanel,
    openAIPanelForPath,
    closeAIPanel,
    clearAIPanel,
    handleActivePathChange,
    handleRefreshReady,
  } = useExplorerAIPanel()

  const { droppedFile, setDroppedFile, isDragOver } = useExplorerDragDrop(setAiPanelOpen)

  const paneCallbacks = useMemo(() => ({
    openAIPanelForPath,
    closeAIPanel,
    clearAIPanel,
  }), [openAIPanelForPath, closeAIPanel, clearAIPanel])

  const {
    panes,
    handleSelectRepo,
    handleSplitSelectRepo,
    handleSplit,
    handleClosePane,
  } = useExplorerPanes(paneCallbacks)

  return {
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
  }
}
