import { create } from 'zustand'

import { APP_ITEMS } from '@/components/ActivityBar/ActivityBar.items'
import type { AppView } from '@/components/ActivityBar/ActivityBar.types'

/**
 * Frontend-only persistence for the user's custom ActivityBar app ordering.
 *
 * The order is stored as a flat list of app `mode` ids and is GLOBAL (shared
 * across every workspace) — the ActivityBar itself is identical everywhere, so
 * there is no per-workspace key. Persistence is manual via localStorage, the
 * same convention used by the rest of the store layer (no zustand `persist`
 * middleware anywhere in this codebase).
 *
 * The saved order is intentionally a *preference overlay*, not the source of
 * truth for which apps exist: membership is owned by `enabledApps` in the
 * settings store. `resolveAppOrder` reconciles the two so that newly enabled
 * apps (or apps added in a future release that aren't in the saved order yet)
 * still appear, slotted at their natural position in the canonical
 * `APP_ITEMS` list.
 */
const STORAGE_KEY = 'genisys.activityBarOrder'

/** Stable empty fallback so selectors never hand back a fresh array literal. */
const EMPTY_ORDER: ReadonlyArray<AppView> = []

function loadFromStorage(): AppView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Keep only string entries — guards against corrupted / hand-edited state.
    return parsed.filter((m): m is AppView => typeof m === 'string')
  } catch {
    return []
  }
}

function saveToStorage(order: AppView[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    // Quota / private mode — silently ignore.
  }
}

interface ActivityBarOrderState {
  /** User's custom order as a list of app `mode` ids. */
  appOrder: AppView[]
}

interface ActivityBarOrderActions {
  /** Replace the persisted order (e.g. after a drag-reorder). */
  setAppOrder: (next: AppView[]) => void
}

export const useActivityBarOrderStore = create<
  ActivityBarOrderState & ActivityBarOrderActions
>()((set) => ({
  appOrder: loadFromStorage(),

  setAppOrder: (next) => {
    set({ appOrder: next })
    saveToStorage(next)
  },
}))

/**
 * Reconcile the saved `appOrder` against the currently `enabledApps` set,
 * returning the final ordered list of modes to render in the ActivityBar.
 *
 * Rules:
 *  - Start from the saved order, keeping only apps that are still enabled
 *    (deduped — stale / repeated entries are dropped).
 *  - Any enabled app missing from the saved order is inserted at *its*
 *    position in the canonical `APP_ITEMS` list: right after the nearest
 *    preceding `APP_ITEMS` sibling that's already in the result (or at the
 *    front if it has no preceding sibling present).
 *
 * This keeps the user's manual ordering intact while giving brand-new apps a
 * predictable, natural home instead of always landing at the end.
 *
 * `enabledApps` is typed as `ReadonlyArray<string>` because the settings store
 * and the ActivityBar declare structurally-distinct `AppView` unions; they
 * share the same app-id domain, so we compare on the string value.
 */
export function resolveAppOrder(
  enabledApps: ReadonlyArray<string>,
  appOrder: ReadonlyArray<AppView>,
): AppView[] {
  const enabledSet = new Set<string>(enabledApps)

  // 1. Saved order, filtered to enabled apps and deduped.
  const seen = new Set<AppView>()
  const result: AppView[] = []
  for (const mode of appOrder) {
    if (enabledSet.has(mode) && !seen.has(mode)) {
      seen.add(mode)
      result.push(mode)
    }
  }

  // 2. Slot in any enabled apps that weren't in the saved order, using their
  //    canonical APP_ITEMS position to decide where they belong.
  const canonical = APP_ITEMS.map((item) => item.mode)
  for (let i = 0; i < canonical.length; i++) {
    const mode = canonical[i]
    if (!enabledSet.has(mode) || seen.has(mode)) continue

    // Walk backwards through the canonical list to find the closest preceding
    // app that already made it into `result`, then insert right after it.
    let insertAt = 0
    for (let j = i - 1; j >= 0; j--) {
      const idx = result.indexOf(canonical[j])
      if (idx !== -1) {
        insertAt = idx + 1
        break
      }
    }
    result.splice(insertAt, 0, mode)
    seen.add(mode)
  }

  return result
}

export { EMPTY_ORDER as EMPTY_APP_ORDER }
