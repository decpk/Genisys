import { ExternalLink, Info, X } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { ShortcutTooltip } from '@/frameworks/shortcut-tooltip'
import { Tooltip } from '@/components/Tooltip'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { findAppEntry } from '@/components/AppStore/data/app-catalog'
import { useNavigationStore } from '@/store/navigation-store'
import { cn } from '@/lib/utils'

import { ActivityBarLabelToggleItem } from '../ActivityBarLabelToggleItem'
import { ActivityBarMoveMenuItems } from '../ActivityBarMoveMenuItems'
import { AppHoverDetails } from './components/AppHoverDetails'
import type { AppModeButtonProps } from './AppModeButton.types'

export function AppModeButton(props: AppModeButtonProps): React.JSX.Element {
  const {
    mode,
    icon: Icon,
    label,
    tooltip,
    shortcutId,
    isActive,
    isActivated,
    onSelect,
    onDeactivate,
    tooltipSide = 'right',
    showLabel = false,
    labelLeftAlign = false,
    hideContextMenu = false,
    sortable = true,
  } = props

  const showOpenIndicator =
    isActivated && !isActive && mode !== 'dashboard' && mode !== 'appstore'
  const iconStrokeWidth = isActive ? 2.5 : isActivated ? 2 : 1.75
  const canClose = isActivated && mode !== 'dashboard' && mode !== 'appstore'
  // Stage 1 hover shows just the app name (+ shortcut). The full one-liner
  // `tooltip` is superseded by the in-depth `expandedContent` card below.
  const tooltipContent = label
  // Stage 2: after the cursor rests on the icon for a few seconds, the Tooltip
  // expands into a richer detail card sourced from the App Store catalog. Apps
  // without a catalog entry (e.g. Settings) get no card — just the name.
  const appEntry = findAppEntry(mode)
  const expandedContent = appEntry ? <AppHoverDetails mode={mode} /> : undefined

  // Each app icon is a sortable item in the ActivityBar's DndContext. The
  // parent decides on drop whether the gesture is a reorder (released inside
  // the bar) or a tear-off into a new window (released outside). Buttons that
  // live outside a SortableContext (the footer Settings button) pass
  // `sortable={false}` so the hook stays inert.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: mode, disabled: !sortable })

  const style: React.CSSProperties = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition,
    // Hide the source icon while it's being dragged so the bar shows a gap
    // exactly where the dragged app lived — the DragOverlay renders the ghost.
    opacity: isDragging ? 0 : 1,
  }

  const button = (
    <button
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(mode)}
      data-active={isActive}
      {...attributes}
      {...listeners}
      className={cn(
        'relative flex items-center gap-1.5 rounded-lg p-2 transition-all duration-150 cursor-pointer shrink-0 select-none touch-none',
        showLabel
          ? labelLeftAlign
            ? 'h-9 px-3 w-full justify-start'
            : 'h-9 px-3 justify-center'
          : 'size-9 justify-center',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        'disabled:pointer-events-none disabled:opacity-30',
        isActive
          ? 'bg-primary/15 text-primary border border-primary/50 shadow-sm hover:bg-primary/20 hover:text-primary'
          : showOpenIndicator
            ? 'bg-foreground/[0.06] text-foreground border border-border/50 hover:bg-foreground/[0.1] hover:text-foreground'
            : 'text-muted-foreground/55 hover:bg-secondary hover:text-foreground/80 border border-transparent',
      )}
    >
      <Icon size={20} strokeWidth={iconStrokeWidth} />
      {showLabel && <span className="text-sm font-medium truncate">{label}</span>}
    </button>
  )

  let wrappedButton: React.ReactNode
  if (showLabel) {
    wrappedButton = button
  } else if (shortcutId) {
    wrappedButton = (
      <ShortcutTooltip content={tooltipContent} shortcutId={shortcutId} side={tooltipSide} expandedContent={expandedContent}>
        {button}
      </ShortcutTooltip>
    )
  } else {
    wrappedButton = (
      <Tooltip content={tooltipContent} side={tooltipSide} expandedContent={expandedContent}>
        {button}
      </Tooltip>
    )
  }

  if (hideContextMenu) {
    return <>{wrappedButton}</>
  }

  return (
    <ContextMenu>
      {/*
        Stop the contextmenu event from bubbling to the ActivityBar's own
        context menu (the "Move to …" repositioning menu). Radix composes this
        handler before its internal one, so the per-app menu below still opens
        while the bar-level menu is suppressed over app icons.
      */}
      <ContextMenuTrigger onContextMenu={(e) => e.stopPropagation()}>
        {wrappedButton}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>{tooltip ?? label}</ContextMenuLabel>
        <ContextMenuSeparator />

        {canClose && (
          <ContextMenuItem onClick={() => onDeactivate?.(mode)}>
            <X size={14} />
            Close
          </ContextMenuItem>
        )}

        <ContextMenuItem
          onClick={() => {
            void window.api?.openAppInNewWindow?.(mode, label)
          }}
        >
          <ExternalLink size={14} />
          Open in New Window
        </ContextMenuItem>

        {appEntry && (
          <ContextMenuItem
            onClick={() => {
              useNavigationStore.getState().openAppStoreDetail(mode)
            }}
          >
            <Info size={14} />
            App Info
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />
        <ContextMenuLabel>Move Activity Bar</ContextMenuLabel>
        <ActivityBarMoveMenuItems />
        <ContextMenuSeparator />
        <ActivityBarLabelToggleItem />
      </ContextMenuContent>
    </ContextMenu>
  )
}
