import { create } from 'zustand'

import type { AppView } from '@/components/ActivityBar/ActivityBar.types'

/**
 * Which half of the main content the pointer is currently over while an app
 * icon is being dragged out of the ActivityBar:
 *  - `'window'`  → top half: release to open the app in a new window
 *  - `'disable'` → bottom half: release to disable the app (hide from the bar)
 */
export type AppDropZone = 'window' | 'disable'

/**
 * Tiny cross-tree signal that bridges the ActivityBar's `@dnd-kit` drag (scoped
 * to its own `<nav>`) to the drop overlay rendered over the main content
 * (`AppDropZones`). The ActivityBar drag handlers own all the geometry; this
 * store only carries the presentational state the overlay needs to read.
 *
 * Selectors must read PRIMITIVES (`draggingApp`, `pointerZone`) so they never
 * hand back a fresh literal and trigger a render loop.
 */
interface AppDragState {
  /** The app being dragged out of the ActivityBar, or `null` when idle. */
  draggingApp: AppView | null
  /** Active drop zone (null while over the bar or outside the main content). */
  pointerZone: AppDropZone | null
}

interface AppDragActions {
  /** Begin a drag for an eligible app (shows the overlay once over the content). */
  startDrag: (app: AppView) => void
  /** Update which zone the pointer is over; `null` hides the overlay. */
  setPointerZone: (zone: AppDropZone | null) => void
  /** Clear all drag state (drop / cancel). */
  endDrag: () => void
}

export const useAppDragStore = create<AppDragState & AppDragActions>()((set) => ({
  draggingApp: null,
  pointerZone: null,

  startDrag: (app) => set({ draggingApp: app, pointerZone: null }),
  // Bail out (return the existing state) when the zone is unchanged so frequent
  // drag-move updates don't notify subscribers needlessly.
  setPointerZone: (zone) =>
    set((s) => (s.pointerZone === zone ? s : { pointerZone: zone })),
  endDrag: () => set({ draggingApp: null, pointerZone: null }),
}))
