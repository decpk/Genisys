import type { AppView } from '@/components/ActivityBar'

/**
 * Singleton holder for the currently-active (visible) app id plus its change
 * listeners. Kept in its own file so every active-app-registry function shares
 * the same module-level state.
 */
export const activeAppState: { current: AppView } = { current: 'dashboard' }

/** Listeners notified whenever the active app changes. */
export const activeAppListeners = new Set<() => void>()
