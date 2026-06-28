import type { AppData } from '@/store/app-data'

type Settings = AppData['settings']

/** Stable id the (now-removed) "Web Browser" dashboard tile used. */
const PRIVATE_BROWSER_TILE_ID = '__private_browser__'

/** `localStorage` keys the removed private browser windows wrote to. */
const PRIVATE_BROWSER_LOCAL_STORAGE_KEYS = [
  'genisys.privateBrowser.lastSession',
  'genisys.privateBrowser.liveNormalWindows',
  'genisys.privateBrowser.tabLayout',
] as const

/**
 * One-time, idempotent cleanup of persisted settings left behind by the
 * removed "Web Browser" (private browser) dashboard tile. Strips the stale
 * tile id from `tileOrder` / `tileVisibility` and drops the orphaned
 * `privateBrowserTileWidth` field. Mutates `settings` in place and returns
 * whether anything changed, so the caller can persist.
 */
export function migratePrivateBrowserRemoval(settings: Settings): boolean {
  let changed = false

  const dashboard = settings.dashboard as
    | (Settings['dashboard'] & Record<string, unknown>)
    | undefined
  if (!dashboard) return false

  if (Array.isArray(dashboard.tileOrder)) {
    const next = dashboard.tileOrder.filter(
      (id) => id !== PRIVATE_BROWSER_TILE_ID,
    )
    if (next.length !== dashboard.tileOrder.length) {
      dashboard.tileOrder = next
      changed = true
    }
  }

  if (
    dashboard.tileVisibility &&
    PRIVATE_BROWSER_TILE_ID in dashboard.tileVisibility
  ) {
    delete dashboard.tileVisibility[PRIVATE_BROWSER_TILE_ID]
    changed = true
  }

  if ('privateBrowserTileWidth' in dashboard) {
    delete dashboard.privateBrowserTileWidth
    changed = true
  }

  return changed
}

/**
 * Remove the `localStorage` keys the (now-removed) private browser windows
 * wrote (session restore + live-window registry + tab layout). Idempotent;
 * `removeItem` is a no-op once the keys are gone.
 */
export function clearPrivateBrowserLocalStorage(): void {
  if (typeof localStorage === 'undefined') return
  for (const key of PRIVATE_BROWSER_LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}
