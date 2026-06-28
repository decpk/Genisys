import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { useEffect, useRef } from 'react'

import type { FsChangeEventPayload } from '@/lib/fs-watcher.types'
import { isExplorerAIStreamActiveForRoot } from '../components/ExplorerAICommand/explorerAIStreamManager'

/**
 * Boots the Rust FS watcher for the given local `rootPath` and auto-invokes
 * `refresh` whenever a workdir change is detected inside the currently
 * displayed folder. No-op for non-local repos (`rootPath === null`).
 *
 * Rust side already debounces, gitignore-filters and suppresses self-writes,
 * so we just forward `workdir` events scoped to the current folder.
 */
export function useExplorerFsAutoRefresh(
  rootPath: string | null,
  currentPath: string,
  refresh: () => void
): void {
  const refreshRef = useRef(refresh)
  const currentPathRef = useRef(currentPath)

  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  useEffect(() => {
    currentPathRef.current = currentPath
  }, [currentPath])

  useEffect(() => {
    if (!rootPath) return undefined

    let cancelled = false
    let unlisten: UnlistenFn | undefined

    const start = async () => {
      try {
        await window.api.fsStartWatching({ rootPath })
      } catch {
        return
      }
      if (cancelled) return
      try {
        unlisten = await listen<FsChangeEventPayload>('fs-change', (event) => {
          const payload = event.payload
          if (!payload || payload.rootPath !== rootPath) return
          if (payload.kind !== 'workdir') return

          // Scope to current folder: refresh only if a changed path's parent
          // directory equals the folder currently shown.
          const cur = currentPathRef.current
          const targetDir = (rootPath + cur).replace(/\/+$/, '')
          const inScope = payload.changedPaths.some((p) => {
            const normalized = p.replace(/\/+$/, '')
            if (normalized === targetDir) return true
            if (!normalized.startsWith(targetDir + '/')) return false
            const rest = normalized.slice(targetDir.length + 1)
            return !rest.includes('/')
          })
          if (!inScope) return

          // While an Explorer AI stream is running for this root, skip the
          // per-operation refresh. A multi-step AI command (e.g. organizing
          // many files) triggers one fs-change per write; the stream manager
          // already fires a single "major" refresh when the turn completes.
          if (isExplorerAIStreamActiveForRoot(rootPath)) return

          refreshRef.current()
        })
      } catch {
        /* ignore — events just won't flow */
      }
    }

    void start()

    return () => {
      cancelled = true
      if (unlisten) {
        try {
          unlisten()
        } catch {
          /* noop */
        }
      }
      try {
        void window.api.fsStopWatching({ rootPath })
      } catch {
        /* noop */
      }
    }
  }, [rootPath])
}
