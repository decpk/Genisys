import { useMemo, useState } from 'react'

import { useExplorerHistoryStore } from '@/store/explorer-history-store'
import { useExplorerPinsStore } from '@/store/explorer-pins-store'
import type { ExplorerPaneConfig, RepoInfo } from '../../ProjectExplorer.types'

export function repoKey(repo: { localPath?: string }): string {
  return `local:${repo.localPath}`
}

export function toRepoInfo(repo: {
  repository: string
  localPath?: string
}): RepoInfo {
  return {
    organization: '',
    project: '',
    repository: repo.repository,
    source: 'local',
    localPath: repo.localPath
  }
}

export function useRepoHistory(activePanes: ExplorerPaneConfig[]) {
  const repos = useExplorerHistoryStore((s) => s.repos)
  const isLoaded = useExplorerHistoryStore((s) => s.isLoaded)
  const hasMore = useExplorerHistoryStore((s) => s.hasMore)
  const loadMore = useExplorerHistoryStore((s) => s.loadMore)
  const removeRepo = useExplorerHistoryStore((s) => s.removeRepo)
  const clearAll = useExplorerHistoryStore((s) => s.clearAll)
  const pinnedRepos = useExplorerPinsStore((s) => s.pinnedRepos)
  const unpinByKey = useExplorerPinsStore((s) => s.unpinByKey)
  const [filter, setFilter] = useState('')
  const [addRepoOpen, setAddRepoOpen] = useState(false)

  const pinnedKeySet = useMemo(
    () => new Set(pinnedRepos.map((r) => repoKey(r))),
    [pinnedRepos]
  )

  const activeRepoMap = useMemo(() => {
    const map = new Map<string, number[]>()
    activePanes.forEach((pane, idx) => {
      if (!pane.repoInfo) return
      const key = repoKey(pane.repoInfo)
      const existing = map.get(key) ?? []
      existing.push(idx + 1)
      map.set(key, existing)
    })
    return map
  }, [activePanes])

  const hasMultiplePanes = activePanes.filter((p) => p.repoInfo).length > 1

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase()
    if (!query) return repos
    return repos.filter(
      (r) =>
        r.repository.toLowerCase().includes(query) ||
        r.project.toLowerCase().includes(query) ||
        r.organization.toLowerCase().includes(query) ||
        (r.localPath ?? '').toLowerCase().includes(query)
    )
  }, [repos, filter])

  const localRepos = useMemo(() => {
    const all = repos.filter(
      (r) => r.source === "local" && !pinnedKeySet.has(repoKey(r)),
    );
    const query = filter.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (r) =>
        r.repository.toLowerCase().includes(query) ||
        (r.localPath ?? "").toLowerCase().includes(query),
    );
  }, [repos, filter, pinnedKeySet]);

  const filteredPinnedRepos = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return pinnedRepos;
    return pinnedRepos.filter(
      (r) =>
        r.repository.toLowerCase().includes(query) ||
        (r.localPath ?? "").toLowerCase().includes(query),
    );
  }, [pinnedRepos, filter]);

  return {
    repos,
    isLoaded,
    hasMore,
    loadMore,
    removeRepo,
    clearAll,
    filter,
    setFilter,
    addRepoOpen,
    setAddRepoOpen,
    activeRepoMap,
    hasMultiplePanes,
    filtered,
    localRepos,
    pinnedRepos: filteredPinnedRepos,
    unpinByKey,
  };
}
