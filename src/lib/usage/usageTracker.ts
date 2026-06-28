import type { AppView } from '@/components/ActivityBar'

import { persistSegment } from './utils/persistSegment'

// ── Module-private mutable state ─────────────────────────────────────────
let enabled = true
let focused = true
let currentActiveApp: AppView | null = null
let currentForegroundStart: number | null = null
let sessionStart: number | null = null
const openSegments = new Map<AppView, number>()

function now(): number {
  return Date.now()
}

/** Ends (persists) the in-flight foreground segment, if any, and clears it. */
function endForeground(): void {
  if (currentForegroundStart != null && currentActiveApp != null) {
    persistSegment('foreground', currentActiveApp, currentForegroundStart, now())
  }
  currentForegroundStart = null
}

/** Starts a fresh foreground segment for the current active app. */
function startForeground(): void {
  if (focused && currentActiveApp != null) {
    currentForegroundStart = now()
  }
}

/**
 * Closes & persists every open segment (open, foreground, session) up to now.
 * When `reseed` is true the still-active segments restart at the same instant,
 * so tracking continues seamlessly (used for midnight rollover and unload).
 * When false, tracking stops (used when disabling).
 */
function flushAll(reseed: boolean): void {
  const t = now()
  const fgStart = currentForegroundStart
  const fgApp = currentActiveApp
  const sStart = sessionStart
  const reopenApps = [...openSegments.keys()]

  if (fgStart != null && fgApp != null) {
    persistSegment('foreground', fgApp, fgStart, t)
  }
  currentForegroundStart = null
  for (const [app, start] of openSegments) {
    persistSegment('open', app, start, t)
  }
  openSegments.clear()
  if (sStart != null) {
    persistSegment('session', null, sStart, t)
  }
  sessionStart = null

  if (reseed) {
    if (sStart != null) sessionStart = t
    for (const app of reopenApps) openSegments.set(app, t)
    if (fgStart != null && focused && currentActiveApp != null) {
      currentForegroundStart = t
    }
  }
}


/**
 * Singleton facade tracking three kinds of usage segments:
 *  - `session`: the whole-Genisys run (single span).
 *  - `open`: one span per app while it stays activated.
 *  - `foreground`: at most one span, the focused+visible app.
 *
 * All event methods are NO-OPs when disabled and never throw. Persistence is
 * fire-and-forget (see {@link persistSegment}).
 */
export const usageTracker = {
  setEnabled(next: boolean): void {
    if (enabled === next) return
    if (!next) {
      // Drain current segments before going dark.
      flushAll(false)
      enabled = false
      return
    }
    enabled = true
    // Re-start fresh based on currently known state.
    sessionStart = now()
    if (currentActiveApp != null) {
      openSegments.set(currentActiveApp, now())
      startForeground()
    }
  },

  onSessionStart(): void {
    if (!enabled) return
    if (sessionStart != null) return
    sessionStart = now()
  },

  onAppActivated(app: AppView): void {
    if (!enabled) return
    if (!openSegments.has(app)) openSegments.set(app, now())
  },

  onAppFocused(app: AppView): void {
    if (!enabled) return
    endForeground()
    currentActiveApp = app
    startForeground()
  },

  onAppDeactivated(app: AppView): void {
    if (!enabled) return
    const start = openSegments.get(app)
    if (start != null) {
      persistSegment('open', app, start, now())
      openSegments.delete(app)
    }
    if (currentActiveApp === app) {
      endForeground()
      currentActiveApp = null
    }
  },

  onWindowFocus(): void {
    if (!enabled) return
    focused = true
    if (currentActiveApp != null && currentForegroundStart == null) {
      currentForegroundStart = now()
    }
  },

  onWindowBlur(): void {
    if (!enabled) return
    focused = false
    endForeground()
  },

  flush(): void {
    flushAll(true)
  },
}
