import { useCallback, useEffect, useRef, useState } from 'react'

import { useExplorerHistoryStore } from '@/store/explorer-history-store'
import type { ExplorerPaneConfig, RepoInfo } from '../ProjectExplorer.types'
import { getLastRepo, setLastRepo } from '../lastRepo.utils'

let paneCounter = 0
let hasRestoredLastRepo = false

interface UseExplorerPanesCallbacks {
  openAIPanelForPath: (rootPath: string) => void
  closeAIPanel: () => void
  clearAIPanel: () => void
}

export function useExplorerPanes(callbacks: UseExplorerPanesCallbacks) {
  const [panes, setPanes] = useState<ExplorerPaneConfig[]>([])
  const addRepo = useExplorerHistoryStore((s) => s.addRepo)

  const saveToHistory = useCallback(
    (repo: RepoInfo) => {
      addRepo({
        repository: repo.repository,
        source: repo.source,
        organization: repo.organization,
        project: repo.project,
        localPath: repo.localPath,
        lastOpenedAt: new Date().toISOString()
      })
    },
    [addRepo]
  )

  const handleSelectRepo = useCallback(
    (repo: RepoInfo) => {
      setPanes([{ id: `pane-${++paneCounter}`, repoInfo: repo }])
      saveToHistory(repo)
      setLastRepo(repo)
      if (repo.source === 'local' && repo.localPath) {
        callbacks.openAIPanelForPath(repo.localPath)
      } else {
        callbacks.closeAIPanel()
      }
    },
    [saveToHistory, callbacks]
  )

  const handleSplitSelectRepo = useCallback(
    (paneId: string, repo: RepoInfo) => {
      setPanes((prev) => prev.map((p) => (p.id === paneId ? { ...p, repoInfo: repo } : p)))
      saveToHistory(repo)
      if (repo.source === 'local' && repo.localPath) {
        callbacks.openAIPanelForPath(repo.localPath)
      }
    },
    [saveToHistory, callbacks]
  )

  const handleSplit = useCallback(() => {
    setPanes((prev) => [...prev, { id: `pane-${++paneCounter}` }])
  }, [])

  const handleSelectRepoRef = useRef(handleSelectRepo)
  handleSelectRepoRef.current = handleSelectRepo

  useEffect(() => {
    if (hasRestoredLastRepo) return
    hasRestoredLastRepo = true
    if (panes.length > 0) return
    const last = getLastRepo()
    if (last) handleSelectRepoRef.current(last)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClosePane = useCallback((paneId: string) => {
    setPanes((prev) => {
      const next = prev.filter((p) => p.id !== paneId)
      if (next.length === 0 || next.every((p) => !p.repoInfo)) {
        callbacks.clearAIPanel()
      }
      return next
    })
  }, [callbacks])

  return {
    panes,
    handleSelectRepo,
    handleSplitSelectRepo,
    handleSplit,
    handleClosePane,
  }
}
