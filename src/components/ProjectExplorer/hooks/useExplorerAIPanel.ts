import { useCallback, useState } from 'react'

export function useExplorerAIPanel() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [activePanePath, setActivePanePath] = useState<{ rootPath: string; currentPath: string } | null>(null)
  const [refreshFn, setRefreshFn] = useState<(() => void) | null>(null)

  const toggleAIPanel = useCallback(() => {
    setAiPanelOpen(prev => !prev)
  }, [])

  const openAIPanelForPath = useCallback((rootPath: string) => {
    setActivePanePath({ rootPath, currentPath: '/' })
    setAiPanelOpen(true)
  }, [])

  const closeAIPanel = useCallback(() => {
    setAiPanelOpen(false)
  }, [])

  const clearAIPanel = useCallback(() => {
    setAiPanelOpen(false)
    setActivePanePath(null)
  }, [])

  const handleActivePathChange = useCallback((rootPath: string, currentPath: string) => {
    setActivePanePath(prev => {
      if (prev?.rootPath === rootPath && prev?.currentPath === currentPath) return prev
      return { rootPath, currentPath }
    })
  }, [])

  const handleRefreshReady = useCallback((fn: () => void) => {
    setRefreshFn(() => fn)
  }, [])

  const isLocalRepo = activePanePath?.rootPath != null

  return {
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
  }
}
