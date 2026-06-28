import type { AppView } from '@/components/ActivityBar'

interface ComputeAppsToEvictParams {
  /** All apps currently mounted (activated). */
  activatedApps: ReadonlyArray<AppView>
  /** Most-recently-used order, index 0 = current app. */
  mru: ReadonlyArray<AppView>
  /** Max mounted non-exempt apps to keep. 0 (or less) = unlimited. */
  limit: number
  /** Apps not counted toward the limit and never evicted (meta/dev surfaces). */
  isExempt: (app: AppView) => boolean
  /** Apps that must stay mounted right now (active app, dashboard, busy apps). */
  isProtected: (app: AppView) => boolean
}

/**
 * Pure LRU keep-alive selector.
 *
 * Given the mounted apps and an MRU order, return the least-recently-used apps
 * to evict so the number of mounted non-exempt apps does not exceed `limit`.
 * Exempt and protected apps are never evicted, so the effective floor is the
 * protected count — i.e. this is a soft cap that always keeps the active app,
 * the dashboard fallback, and any app currently running a task.
 */
export function computeAppsToEvict(params: ComputeAppsToEvictParams): AppView[] {
  const { activatedApps, mru, limit, isExempt, isProtected } = params

  if (!Number.isFinite(limit) || limit <= 0) return []

  const countable = activatedApps.filter((app) => !isExempt(app))
  const overflow = countable.length - limit
  if (overflow <= 0) return []

  const mruIndex = new Map<AppView, number>()
  mru.forEach((app, index) => mruIndex.set(app, index))

  const evictable = countable.filter((app) => !isProtected(app))
  // Least-recently-used first: larger MRU index = older. Apps missing from the
  // MRU stack are treated as oldest (most evictable).
  evictable.sort((a, b) => {
    const ai = mruIndex.get(a) ?? Number.POSITIVE_INFINITY
    const bi = mruIndex.get(b) ?? Number.POSITIVE_INFINITY
    return bi - ai
  })

  return evictable.slice(0, overflow)
}
