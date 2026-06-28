import { useCallback, useMemo, useState } from 'react'
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import { useSettingsStore } from '@/store/settings-store'
import {
  resolveAppOrder,
  useActivityBarOrderStore,
} from '@/store/activity-bar-order-store'
import { useAppDragStore, type AppDropZone } from '@/store/app-drag-store'
import { scopedToast } from '@/frameworks/notification'

import { APP_ITEMS, type AppItem } from './ActivityBar.items'
import { isPointOutsideRect } from './AppModeButton/utils/isPointOutsideRect'
import type { AppView } from './ActivityBar.types'

/**
 * Apps that live in the ActivityBar nav but must never tear off into their own
 * window: `dashboard` is the always-on home and `appstore` is how the user
 * re-enables apps, so both stay docked. (Settings isn't in the nav list — it
 * has its own footer button — so it doesn't need to be listed here.)
 */
const DETACH_EXCLUDED: ReadonlySet<AppView> = new Set<AppView>([
  'dashboard',
  'appstore',
])

interface UseActivityBarDataParams {
  /** Bounding rect of the bar `<aside>`, used to decide reorder vs. detach. */
  getBarRect: () => DOMRect | null
  /** Restrict the bar to a fixed app set (detached single-app windows). */
  visibleApps?: AppView[]
  activated?: Record<AppView, boolean>
  onDeactivateApp?: (app: AppView) => void
}

interface UseActivityBarDataResult {
  /** Final ordered list of app items to render in the nav. */
  orderedItems: AppItem[]
  /** Modes in render order — the `SortableContext` item ids. */
  sortableIds: AppView[]
  /** True when drag-to-reorder / drag-to-detach is active for this bar. */
  draggable: boolean
  sensors: ReturnType<typeof useSensors>
  /** The item currently being dragged (for the DragOverlay), or null. */
  activeItem: AppItem | null
  /** True while dragging and the cursor is outside the bar (detach intent). */
  isOutsideBar: boolean
  handleDragStart: (event: DragStartEvent) => void
  handleDragMove: (event: DragMoveEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
}

/** Resolve the final pointer position from a drag event's activator + delta. */
function getEventPoint(
  activatorEvent: Event | null,
  delta: { x: number; y: number },
): { x: number; y: number } | null {
  if (activatorEvent && 'clientX' in activatorEvent) {
    const pe = activatorEvent as PointerEvent
    return { x: pe.clientX + delta.x, y: pe.clientY + delta.y }
  }
  return null
}

/** Live bounding rect of the main content area (the drop-zone target). */
function getMainRect(): DOMRect | null {
  if (typeof document === 'undefined') return null
  const el = document.querySelector('[data-genisys-main]')
  return el ? el.getBoundingClientRect() : null
}

/**
 * Decide which drop zone a pointer is over within the main content:
 *  - top half    → `'window'` (open the app in a new window)
 *  - bottom half → `'disable'` (remove the app from the ActivityBar)
 *  - outside the rect → `null`
 */
function computeDropZone(
  point: { x: number; y: number } | null,
  rect: DOMRect | null,
): AppDropZone | null {
  if (!point || !rect) return null
  const inside =
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  if (!inside) return null
  return point.y < rect.top + rect.height / 2 ? 'window' : 'disable'
}

/** Disable toasts are attributed to Genisys (system), not a specific app. */
const toast = scopedToast('system')

export function useActivityBarData(
  params: UseActivityBarDataParams,
): UseActivityBarDataResult {
  const { getBarRect, visibleApps, activated, onDeactivateApp } = params

  const enabledApps = useSettingsStore((s) => s.enabledApps)
  const toggleAppEnabled = useSettingsStore((s) => s.toggleAppEnabled)
  const appOrder = useActivityBarOrderStore((s) => s.appOrder)
  const setAppOrder = useActivityBarOrderStore((s) => s.setAppOrder)

  const startAppDrag = useAppDragStore((s) => s.startDrag)
  const setDragPointerZone = useAppDragStore((s) => s.setPointerZone)
  const endAppDrag = useAppDragStore((s) => s.endDrag)

  const [activeMode, setActiveMode] = useState<AppView | null>(null)
  const [isOutsideBar, setIsOutsideBar] = useState(false)

  // Detached single-app windows pass an explicit `visibleApps` set and stay
  // static — only the main bar (driven by `enabledApps`) is reorderable.
  const draggable = !visibleApps

  const orderedItems = useMemo<AppItem[]>(() => {
    if (visibleApps) {
      return APP_ITEMS.filter((item) => visibleApps.includes(item.mode))
    }
    const order = resolveAppOrder(enabledApps, appOrder)
    const byMode = new Map<string, AppItem>(APP_ITEMS.map((item) => [item.mode, item]))
    return order
      .map((mode) => byMode.get(mode))
      .filter((item): item is AppItem => item !== undefined)
  }, [visibleApps, enabledApps, appOrder])

  const sortableIds = useMemo<AppView[]>(
    () => orderedItems.map((item) => item.mode),
    [orderedItems],
  )

  const activeItem = useMemo<AppItem | null>(
    () => (activeMode ? orderedItems.find((i) => i.mode === activeMode) ?? null : null),
    [activeMode, orderedItems],
  )

  // 6px matches the legacy pointer-detach start threshold so a click never
  // accidentally promotes into a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const mode = event.active.id as AppView
      setActiveMode(mode)
      setIsOutsideBar(false)
      // Eligible apps (everything except the pinned dashboard / appstore) get
      // the main-content drop overlay; pinned apps stay reorder-only.
      if (!DETACH_EXCLUDED.has(mode)) startAppDrag(mode)
    },
    [startAppDrag],
  )

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const point = getEventPoint(event.activatorEvent, event.delta)
      const rect = getBarRect()
      // Treat "outside" as a detach intent only when we actually have a rect;
      // a missing rect should not flip a reorder into a surprise tear-off.
      setIsOutsideBar(!!point && !!rect && isPointOutsideRect(point, rect))
      // Drive the main-content overlay's active zone (top vs. bottom half).
      const mode = event.active.id as AppView
      if (!DETACH_EXCLUDED.has(mode)) {
        setDragPointerZone(computeDropZone(point, getMainRect()))
      }
    },
    [getBarRect, setDragPointerZone],
  )

  const handleDragCancel = useCallback(() => {
    setActiveMode(null)
    setIsOutsideBar(false)
    endAppDrag()
  }, [endAppDrag])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta, activatorEvent } = event
      const mode = active.id as AppView

      setActiveMode(null)
      setIsOutsideBar(false)

      const point = getEventPoint(activatorEvent, delta)
      const rect = getBarRect()
      const droppedOutside = !!point && !!rect && isPointOutsideRect(point, rect)
      const eligible = !DETACH_EXCLUDED.has(mode)
      const zone = eligible ? computeDropZone(point, getMainRect()) : null

      // Clear the drop overlay regardless of which branch handles the drop.
      endAppDrag()

      // (A) Released over the bottom (disable) zone → remove the app from the
      // ActivityBar. The `useAppMode` enablement guard then unmounts it and, if
      // it was the active app, redirects to dashboard — so here we only flip
      // enablement and surface an undo affordance.
      if (zone === 'disable') {
        const item = APP_ITEMS.find((i) => i.mode === mode)
        const label = item?.label ?? mode
        toggleAppEnabled(mode)
        toast.success(`${label} disabled`, {
          description: 'Re-enable it anytime from the App Store.',
          action: {
            label: 'Undo',
            onClick: () => {
              // Read fresh state so a double-undo (or a manual re-enable in the
              // meantime) can never accidentally toggle the app back off.
              const settings = useSettingsStore.getState()
              if (!settings.enabledApps.includes(mode)) {
                settings.toggleAppEnabled(mode)
              }
            },
          },
        })
        return
      }

      // (B) Released over the top (window) zone — or anywhere outside the bar —
      // → tear off into a standalone window (eligible apps only).
      if (eligible && (zone === 'window' || droppedOutside) && point) {
        const item = APP_ITEMS.find((i) => i.mode === mode)
        const label = item?.label ?? mode
        // Convert client coords to screen coords using the host window offset
        // (Tauri puts content at the top of the OS window — accurate to within
        // the title bar height, close enough for tear-off placement).
        const screenX = window.screenX + point.x
        const screenY = window.screenY + point.y
        void window.api?.openAppInNewWindow?.(mode, label, { x: screenX, y: screenY })
        if (activated?.[mode]) onDeactivateApp?.(mode)
        return
      }

      // (C) Released inside the bar over a different item → reorder + persist.
      if (over && active.id !== over.id) {
        const oldIndex = sortableIds.indexOf(mode)
        const newIndex = sortableIds.indexOf(over.id as AppView)
        if (oldIndex === -1 || newIndex === -1) return
        setAppOrder(arrayMove(sortableIds, oldIndex, newIndex))
      }
    },
    [getBarRect, sortableIds, setAppOrder, activated, onDeactivateApp, toggleAppEnabled, endAppDrag],
  )

  return {
    orderedItems,
    sortableIds,
    draggable,
    sensors,
    activeItem,
    isOutsideBar,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
  }
}
