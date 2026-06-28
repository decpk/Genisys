import { useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { GenisysIconReveal } from '@/components/GenisysIconReveal'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settings-store'

import { ActivityBarActions } from './ActivityBarActions'
import { ActivityBarLabelToggleItem } from './ActivityBarLabelToggleItem'
import { ActivityBarMoveMenuItems } from './ActivityBarMoveMenuItems'
import { AppDetachPreview } from './AppDetachPreview'
import { AppModeButton } from './AppModeButton'
import { useActivityBarData } from './useActivityBarData'
import { useActivityBarLabelDrag } from './useActivityBarLabelDrag'
import { useActivityBarScroll } from './useActivityBarScroll'
import { useDevToolsVisible } from './useDevToolsVisible'
import type { ActivityBarProps } from './ActivityBar.types'

export function ActivityBar(props: ActivityBarProps): React.JSX.Element {
  const { activeApp, onActiveAppChange, activated, onDeactivateApp, visibleApps } = props

  const position = useSettingsStore((s) => s.activityBarPosition)
  const showLabels = useSettingsStore((s) => s.showActivityBarLabels)
  const devShowDebugTools = useDevToolsVisible()
  const isHorizontal = position === 'top' || position === 'bottom'
  const tooltipSide =
    position === 'left'
      ? 'right'
      : position === 'right'
        ? 'left'
        : position === 'top'
          ? 'bottom'
          : 'top'
  const borderClass =
    position === 'left'
      ? 'border-r'
      : position === 'right'
        ? 'border-l'
        : position === 'top'
          ? 'border-b'
          : 'border-t'

  const labelVisible = showLabels
  // When labels are shown on a vertical (left/right) bar, widen it and switch
  // the buttons to a left-aligned, full-width column so the app names fit.
  const verticalWithLabels = !isHorizontal && labelVisible

  const asideClass = isHorizontal
    ? `sidebar-theme shrink-0 h-12 w-full bg-card ${borderClass} border-border/40 flex items-center px-3 gap-1`
    : `sidebar-theme relative shrink-0 ${verticalWithLabels ? 'w-48 items-stretch px-2' : 'w-12 items-center'} h-full bg-card ${borderClass} border-border/40 flex flex-col py-3 gap-1`
  const navClass = isHorizontal
    ? 'flex gap-1 w-full min-w-0 overflow-x-auto scrollbar-none [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] px-1'
    : `flex flex-col gap-1 flex-1 ${verticalWithLabels ? 'items-stretch' : 'items-center'}`
  const footerClass = isHorizontal
    ? 'flex items-center gap-1'
    : `flex flex-col gap-1 ${verticalWithLabels ? 'items-stretch' : 'items-center'}`

  // Used by the drag handlers to decide whether a drop landed outside the bar
  // (→ detach into a new window) or inside it (→ reorder). Captured via ref so
  // we always read the latest layout/position.
  const asideRef = useRef<HTMLElement | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const getBarRect = useCallback(
    () => asideRef.current?.getBoundingClientRect() ?? null,
    [],
  )

  // On a horizontal (top/bottom) bar the row can overflow with many apps.
  // Translate the natural vertical wheel gesture into horizontal scrolling so
  // users can reach every app without a visible scrollbar.
  const handleNavWheel = useCallback((e: React.WheelEvent) => {
    const el = navRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY
    }
  }, [])

  // Keep the active app visible when switching (e.g. via keyboard) so the
  // selection never hides off-screen in the scrollable row.
  useEffect(() => {
    if (!isHorizontal) return
    const active = navRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [activeApp, isHorizontal])

  const {
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
  } = useActivityBarData({ getBarRect, visibleApps, activated, onDeactivateApp })

  // Drives the left/right scroll chevrons on the horizontal (top/bottom) bar.
  // Re-measures when the app count or label visibility changes the row width.
  const { canScrollLeft, canScrollRight, scrollByStep } = useActivityBarScroll({
    navRef,
    enabled: isHorizontal,
    recomputeKey: `${orderedItems.length}-${showLabels}`,
  })

  // Lets the user drag the vertical bar's inner edge to reveal / hide labels.
  const labelDrag = useActivityBarLabelDrag({
    position,
    enabled: !isHorizontal && !visibleApps,
  })
  const showLabelDragHandle = !isHorizontal && !visibleApps

  const appButtons = orderedItems.map(({ mode, icon: Icon, label, tooltip, shortcutId }) => (
    <AppModeButton
      key={mode}
      mode={mode}
      icon={Icon}
      label={label}
      tooltip={tooltip}
      shortcutId={shortcutId}
      isActive={activeApp === mode}
      isActivated={activated?.[mode] ?? false}
      onSelect={onActiveAppChange}
      onDeactivate={onDeactivateApp}
      tooltipSide={tooltipSide}
      showLabel={labelVisible}
      labelLeftAlign={verticalWithLabels}
      hideContextMenu={!!visibleApps}
      sortable={draggable}
    />
  ))

  const navElement = (
    <nav ref={navRef} className={navClass} onWheel={isHorizontal ? handleNavWheel : undefined}>
      {draggable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={sortableIds}
            strategy={isHorizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}
          >
            {appButtons}
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <AppDetachPreview icon={activeItem.icon} showDropHint={isOutsideBar} />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        appButtons
      )}
    </nav>
  )

  const bar = (
    <aside ref={asideRef} className={asideClass}>
      {showLabelDragHandle && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={showLabels ? 'Drag to hide labels' : 'Drag to show labels'}
          title={showLabels ? 'Drag to hide labels' : 'Drag to show labels'}
          onPointerDown={labelDrag.onPointerDown}
          onPointerMove={labelDrag.onPointerMove}
          onPointerUp={labelDrag.onPointerUp}
          className={cn(
            'group/labeldrag absolute top-0 z-20 h-full w-2 cursor-col-resize touch-none',
            position === 'right' ? 'left-0' : 'right-0',
          )}
        >
          <div
            className={cn(
              'absolute inset-y-0 w-px bg-transparent transition-colors group-hover/labeldrag:bg-primary/40',
              position === 'right' ? 'left-0' : 'right-0',
            )}
          />
        </div>
      )}
      <div
        className={
          isHorizontal
            ? 'mr-4 flex items-center'
            : verticalWithLabels
              ? 'mb-4 flex items-center gap-2 px-2'
              : 'mb-4 flex justify-center'
        }
      >
        <GenisysIconReveal size={24} className="text-primary" />
        {verticalWithLabels && (
          <span className="text-sm font-semibold text-foreground select-none">Genisys</span>
        )}
      </div>
      {isHorizontal ? (
        <div className="relative flex min-w-0 flex-1 items-center">
          {canScrollLeft && (
            <button
              type="button"
              aria-label="Scroll apps left"
              onClick={() => scrollByStep(-1)}
              className="absolute left-0 inset-y-0 z-10 flex w-7 items-center justify-start bg-gradient-to-r from-card via-card/90 to-transparent text-muted-foreground/70 transition-colors hover:text-foreground cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {navElement}
          {canScrollRight && (
            <button
              type="button"
              aria-label="Scroll apps right"
              onClick={() => scrollByStep(1)}
              className="absolute right-0 inset-y-0 z-10 flex w-7 items-center justify-end bg-gradient-to-l from-card via-card/90 to-transparent text-muted-foreground/70 transition-colors hover:text-foreground cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      ) : (
        navElement
      )}
      <div className={footerClass}>
        <ActivityBarActions tooltipSide={tooltipSide} isHorizontal={isHorizontal} activeApp={activeApp} onActiveAppChange={onActiveAppChange} showLabel={labelVisible} labelLeftAlign={verticalWithLabels} />

        {devShowDebugTools && <DevActionsDivider isHorizontal={isHorizontal} fullWidth={verticalWithLabels} />}

        <ThemeSwitcher isCompact showLabel={labelVisible} labelLeftAlign={verticalWithLabels} tooltipSide={tooltipSide} />
        {!visibleApps && (
          <AppModeButton
            mode="settings"
            icon={Settings}
            label="Settings"
            shortcutId="global.settings.openFullApp"
            isActive={activeApp === 'settings'}
            isActivated={activated?.settings ?? false}
            onSelect={onActiveAppChange}
            onDeactivate={onDeactivateApp}
            tooltipSide={tooltipSide}
            showLabel={labelVisible}
            labelLeftAlign={verticalWithLabels}
            sortable={false}
          />
        )}
      </div>
    </aside>
  )

  // Detached app windows (`visibleApps` set) render a static bar with no
  // repositioning affordance. In the main window, right-clicking the bar's
  // empty chrome opens a menu to move the Activity Bar to any other edge. App
  // icons carry the same "Move to …" items in their own menu (see
  // AppModeButton) so the bar can be repositioned even when icons fill it.
  if (visibleApps) return bar

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{bar}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Activity Bar</ContextMenuLabel>
        <ContextMenuSeparator />
        <ActivityBarMoveMenuItems />
        <ContextMenuSeparator />
        <ActivityBarLabelToggleItem />
      </ContextMenuContent>
    </ContextMenu>
  )
}

function DevActionsDivider(props: { isHorizontal: boolean; fullWidth?: boolean }): React.JSX.Element {
  const { isHorizontal, fullWidth = false } = props
  return (
    <div
      className={
        isHorizontal
          ? 'w-px h-5 bg-border mx-0.5'
          : `h-px bg-border my-0.5 ${fullWidth ? 'w-full' : 'w-5'}`
      }
    />
  )
}
