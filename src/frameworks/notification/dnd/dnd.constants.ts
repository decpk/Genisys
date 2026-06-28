import type { DndConfig } from './dnd.types'

/** Maximum number of user-configurable DND ranges. */
export const MAX_DND_RANGES = 5

/** Default DND configuration — disabled with no ranges. */
export const DND_DEFAULTS: DndConfig = {
  enabled: false,
  ranges: [],
}

/**
 * Meta key used to mark a notification that was suppressed because DND
 * was active when `notify()` was called. Persisted into the notification
 * row's `meta` JSON so the Notifications history can later distinguish
 * delivered vs. quietly-dropped notifications.
 */
export const DND_SUPPRESSED_META_KEY = 'suppressedByDnd'
