import type { ToolModule } from '@/ai/tools/tools.types'
import { createGitToolModules } from '@/ai/tools/_shared/git'
import { useExplorerHistoryStore } from '@/store/explorer-history-store'

/**
 * Build the git tool modules wired into the Project Explorer AI
 * assistant. PE doesn't have a single "current folder" concept the
 * way the Code app does, so we resolve the root path to the most
 * recently opened entry that has a `localPath` (i.e. a cloned/local
 * repo). When no eligible entry exists, every git tool short-circuits
 * with a clean error via `withRepo`.
 *
 * No `onMutate` callback is wired — Project Explorer doesn't have an
 * analogous git event bus. The Tauri-side FS watcher will surface
 * mutations on its own debounce.
 */
export function createExplorerGitTools(): ToolModule[] {
  return createGitToolModules({
    getRootPath: () => {
      const repos = useExplorerHistoryStore.getState().repos
      const local = repos.find((r) => typeof r.localPath === 'string' && r.localPath.length > 0)
      return local?.localPath ?? null
    },
  })
}
