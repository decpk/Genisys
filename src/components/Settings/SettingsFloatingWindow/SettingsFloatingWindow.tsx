import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Settings } from '@/components/Settings'
import { useDraggable, useEscapeKey, useResizable, useWindowSize } from '@/hooks'
import { cn } from '@/lib/utils'
import { SETTINGS_WINDOW_SIZE } from '@/store/settings-drawer-store'

import {
  SettingsFloatingWindowHeader,
} from './components/SettingsFloatingWindowHeader'
import {
  SettingsFloatingWindowResizer,
} from './components/SettingsFloatingWindowResizer'
import { useSettingsFloatingWindowData } from './hooks/useSettingsFloatingWindowData'
import { settingsFloatingWindowStyles as S } from './SettingsFloatingWindow.styles'
import type { SettingsFloatingWindowProps } from './SettingsFloatingWindow.types'
import { centerInViewport } from './utils/centerInViewport'
import { clampSize } from './utils/clampSize'
import { clampToViewport } from './utils/clampToViewport'

/**
 * Floating, draggable, resizable Settings window. Renders over any
 * host app when `useSettingsDrawerStore.isOpen` is true.
 *
 * **60fps optimization strategy:**
 *  - Position is applied via `transform: translate3d()` (composite-only,
 *    no layout) instead of `left/top`.
 *  - Drag + resize are driven imperatively by `useDraggable` /
 *    `useResizable` via a shared `windowRef` + `requestAnimationFrame`.
 *    React state only commits on pointer-up, so the heavy `<Settings />`
 *    subtree never re-renders mid-drag.
 *  - The Settings body element is memoized so reconciliation skips it
 *    when the parent re-renders for transient flags (e.g. `isDragging`).
 */
export function SettingsFloatingWindow({
  activeApp,
  onOpenFullApp,
}: SettingsFloatingWindowProps) {
  const {
    isOpen,
    isLoaded,
    position: persistedPosition,
    size: persistedSize,
    setPosition,
    setSize,
    close,
  } = useSettingsFloatingWindowData()

  const viewport = useWindowSize()

  // Clamp persisted size to current viewport (covers monitor changes).
  const effectiveSize = useMemo(
    () => clampSize(persistedSize, viewport),
    [persistedSize, viewport],
  )

  // Resolve final position: persisted (clamped) or centered fallback.
  const effectivePosition = useMemo(() => {
    if (persistedPosition) {
      return clampToViewport(persistedPosition, effectiveSize, viewport)
    }
    return centerInViewport(effectiveSize, viewport)
  }, [persistedPosition, effectiveSize, viewport])

  // Local mount-mode trigger for the open animation.
  const [hasMounted, setHasMounted] = useState(false)
  const [lastIsOpen, setLastIsOpen] = useState(isOpen)
  if (lastIsOpen !== isOpen) {
    setLastIsOpen(isOpen)
    if (!isOpen) setHasMounted(false)
  }
  useEffect(() => {
    if (!isOpen) return undefined
    const id = requestAnimationFrame(() => setHasMounted(true))
    return () => cancelAnimationFrame(id)
  }, [isOpen])

  // Single ref shared with both drag + resize hooks for imperative
  // DOM mutation during the gesture (60fps).
  const windowRef = useRef<HTMLDivElement | null>(null)

  const { position: dragPosition, isDragging, handleProps: dragHandleProps } =
    useDraggable({
      position: effectivePosition,
      targetRef: windowRef,
      onDragEnd: (next) => {
        setPosition(clampToViewport(next, effectiveSize, viewport))
      },
    })

  const { size: liveSize, isResizing, handleProps: resizeHandleProps } =
    useResizable({
      size: effectiveSize,
      targetRef: windowRef,
      minWidth: SETTINGS_WINDOW_SIZE.MIN_WIDTH,
      minHeight: SETTINGS_WINDOW_SIZE.MIN_HEIGHT,
      maxWidth: Math.min(
        SETTINGS_WINDOW_SIZE.MAX_WIDTH,
        Math.floor(
          viewport.width * SETTINGS_WINDOW_SIZE.MAX_VIEWPORT_FRACTION,
        ),
      ),
      maxHeight: Math.min(
        SETTINGS_WINDOW_SIZE.MAX_HEIGHT,
        Math.floor(
          viewport.height * SETTINGS_WINDOW_SIZE.MAX_VIEWPORT_FRACTION,
        ),
      ),
      onResizeEnd: (next) => setSize(next),
    })

  // Esc closes the window — installed only while open.
  useEscapeKey(close, isOpen)

  // Memoize the heavy Settings body so renders triggered by `isDragging`
  // / `isResizing` / `hasMounted` toggles don't reach into Settings.
  const settingsBody = useMemo(
    () => (
      <ErrorBoundary componentName="SettingsFloatingWindow">
        <Suspense
          fallback={
            <div className={S.fallback}>
              <span className="text-xs text-muted-foreground">
                Loading settings…
              </span>
            </div>
          }
        >
          <Settings />
        </Suspense>
      </ErrorBoundary>
    ),
    [],
  )

  // Hide entirely when the full Settings app is active in the host shell —
  // avoids stacking the same UI on top of itself.
  const shouldRender = isOpen && isLoaded && activeApp !== 'settings'
  if (!shouldRender) return null

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-modal={false}
      aria-label="Settings"
      className={cn(
        S.root,
        (isDragging || isResizing) && S.rootDragging,
        // open animation — opacity only, so it can compose with transform
        'transition-opacity duration-150 ease-out',
        hasMounted ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        // transform: GPU-composited, no layout cost on drag.
        transform: `translate3d(${dragPosition.x}px, ${dragPosition.y}px, 0)`,
        width: liveSize.width,
        height: liveSize.height,
        // Hint the compositor: keep this element on its own layer while
        // a gesture is active. Removed when idle so we don't waste GPU
        // memory.
        willChange: isDragging || isResizing ? 'transform, width, height' : 'auto',
      }}
    >
      <SettingsFloatingWindowHeader
        activeApp={activeApp}
        isDragging={isDragging}
        onOpenFullApp={() => {
          close()
          onOpenFullApp()
        }}
        onClose={close}
        dragHandleProps={dragHandleProps}
      />

      <div className={S.body}>{settingsBody}</div>

      <SettingsFloatingWindowResizer
        isResizing={isResizing}
        resizeHandleProps={resizeHandleProps}
      />
    </div>
  )
}
