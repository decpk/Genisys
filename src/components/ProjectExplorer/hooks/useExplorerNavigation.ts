import { useState, useCallback, useRef, startTransition } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('explorer')

import type { RepoItem, NavEntry, RepoInfo } from '../ProjectExplorer.types'

interface ExplorerState {
  repoInfo: RepoInfo | null
  items: RepoItem[]
  fileContent: string | null
  history: NavEntry[]
  historyIndex: number
  isLoading: boolean
  error: string | null
}

const INITIAL: ExplorerState = {
  repoInfo: null,
  items: [],
  fileContent: null,
  history: [],
  historyIndex: -1,
  isLoading: false,
  error: null
}

// In-memory LRU folder cache — keyed by `source:rootPath:path`
const FOLDER_CACHE_MAX = 50
const folderCache = new Map<string, RepoItem[]>()

function getCacheKey(repo: RepoInfo, path: string): string {
  return `local:${repo.localPath}:${path}`
}

function cacheSet(key: string, items: RepoItem[]): void {
  // Delete first to move to end (Map preserves insertion order)
  folderCache.delete(key)
  folderCache.set(key, items)
  if (folderCache.size > FOLDER_CACHE_MAX) {
    const oldest = folderCache.keys().next().value
    if (oldest) folderCache.delete(oldest)
  }
}

export function useExplorerNavigation(initialShowHidden = false) {
  const [state, setState] = useState<ExplorerState>(INITIAL)
  const repoRef = useRef<RepoInfo | null>(null)
  const showHiddenRef = useRef(initialShowHidden)

  const current = state.historyIndex >= 0 ? state.history[state.historyIndex] : null

  const setShowHidden = useCallback((value: boolean) => {
    showHiddenRef.current = value
  }, [])

  const loadItems = useCallback(async (repo: RepoInfo, path: string, skipCache = false) => {
    const cacheKey = getCacheKey(repo, path)

    // Serve from cache instantly if available
    if (!skipCache) {
      const cached = folderCache.get(cacheKey)
      if (cached) {
        startTransition(() => {
          setState((p) => ({ ...p, items: cached, fileContent: null, isLoading: false }))
        })
        return
      }
    }

    setState((p) => ({ ...p, isLoading: true, error: null }))

    const result = await window.api.getLocalRepoItems({
      rootPath: repo.localPath!,
      path,
      showHidden: showHiddenRef.current
    })

    if (result.success) {
      const items = result.data ?? []
      cacheSet(cacheKey, items)
      startTransition(() => {
        setState((p) => ({ ...p, items, fileContent: null, isLoading: false }))
      })
    } else {
      const errorMsg = result.error ?? 'Failed to load items'
      setState((p) => ({ ...p, items: [], isLoading: false, error: errorMsg }))
      toast.error(errorMsg)
    }
  }, [])

  const loadFile = useCallback(async (repo: RepoInfo, path: string, objectId?: string) => {
    setState((p) => ({ ...p, isLoading: true, error: null }))

    const result = await window.api.getLocalFileContent({ rootPath: repo.localPath!, filePath: path })

    if (result.success) {
      setState((p) => ({ ...p, fileContent: result.data ?? '', isLoading: false }))
    } else {
      const errorMsg = result.error ?? 'Failed to load file'
      setState((p) => ({ ...p, isLoading: false, error: errorMsg }))
      toast.error(errorMsg)
    }
  }, [])

  const initRepo = useCallback(
    async (repo: RepoInfo) => {
      repoRef.current = repo
      const entry: NavEntry = { path: '/', type: 'folder' }
      setState({ ...INITIAL, repoInfo: repo, history: [entry], historyIndex: 0, isLoading: true })
      await loadItems(repo, '/')
    },
    [loadItems]
  )

  const navigateToFolder = useCallback(
    async (path: string) => {
      const repo = repoRef.current
      if (!repo) return
      setState((p) => ({
        ...p,
        history: [...p.history.slice(0, p.historyIndex + 1), { path, type: 'folder' as const }],
        historyIndex: p.historyIndex + 1
      }))
      await loadItems(repo, path)
    },
    [loadItems]
  )

  const openFile = useCallback(
    async (path: string, objectId: string) => {
      const repo = repoRef.current
      if (!repo) return
      setState((p) => ({
        ...p,
        history: [
          ...p.history.slice(0, p.historyIndex + 1),
          { path, type: 'file' as const, objectId }
        ],
        historyIndex: p.historyIndex + 1
      }))
      await loadFile(repo, path, objectId)
    },
    [loadFile]
  )

  const goBack = useCallback(async () => {
    const repo = repoRef.current
    if (!repo) return
    let entry: NavEntry | null = null
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev
      entry = prev.history[prev.historyIndex - 1]
      return { ...prev, historyIndex: prev.historyIndex - 1 }
    })
    if (!entry) return
    if ((entry as NavEntry).type === 'folder') await loadItems(repo, (entry as NavEntry).path)
    else if ((entry as NavEntry).objectId)
      await loadFile(repo, (entry as NavEntry).path, (entry as NavEntry).objectId!)
  }, [loadItems, loadFile])

  const goForward = useCallback(async () => {
    const repo = repoRef.current
    if (!repo) return
    let entry: NavEntry | null = null
    setState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev
      entry = prev.history[prev.historyIndex + 1]
      return { ...prev, historyIndex: prev.historyIndex + 1 }
    })
    if (!entry) return
    if ((entry as NavEntry).type === 'folder') await loadItems(repo, (entry as NavEntry).path)
    else if ((entry as NavEntry).objectId)
      await loadFile(repo, (entry as NavEntry).path, (entry as NavEntry).objectId!)
  }, [loadItems, loadFile])

  return {
    repoInfo: state.repoInfo,
    items: state.items,
    fileContent: state.fileContent,
    isLoading: state.isLoading,
    error: state.error,
    currentPath: current?.path ?? '/',
    isViewingFile: current?.type === 'file',
    canGoBack: state.historyIndex > 0,
    canGoForward: state.historyIndex < state.history.length - 1,
    initRepo,
    navigateToFolder,
    openFile,
    goBack,
    goForward,
    clearError: useCallback(() => setState((p) => ({ ...p, error: null })), []),
    setShowHidden,
    refresh: useCallback(async () => {
      const repo = repoRef.current
      if (!repo || !current) return
      if (current.type === 'folder') await loadItems(repo, current.path, true)
      else if (current.objectId) await loadFile(repo, current.path, current.objectId)
    }, [current, loadItems, loadFile])
  }
}
