/**
 * Shared module-level state for the app-activity registry.
 *
 * Holds the set of apps currently reporting "busy" (running a task that must
 * not be interrupted by keep-alive eviction) plus the change listeners. Kept
 * in its own file so every registry function imports the same singleton.
 */

/** App ids currently reporting a running task. Absence means "not busy". */
export const busyApps = new Map<string, boolean>()

/** Listeners notified whenever the busy set changes. */
export const busyListeners = new Set<() => void>()
