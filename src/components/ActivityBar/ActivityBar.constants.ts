import { PanelBottom, PanelLeft, PanelRight, PanelTop } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ActivityBarPosition } from '@/store/settings-store'

/**
 * Edges the ActivityBar can be moved to, with the icon + label shown in the
 * bar's right-click "Move to …" context menu. The menu filters out the entry
 * matching the current position so only the available destinations appear.
 */
export const ACTIVITY_BAR_POSITION_ITEMS: ReadonlyArray<{
  value: ActivityBarPosition
  label: string
  icon: React.ComponentType<{ size?: number | string }>
}> = [
  { value: 'left', label: 'Move to Left', icon: PanelLeft },
  { value: 'right', label: 'Move to Right', icon: PanelRight },
  { value: 'top', label: 'Move to Top', icon: PanelTop },
  { value: 'bottom', label: 'Move to Bottom', icon: PanelBottom },
]

/**
 * Shared className for full-width / centered icon + label buttons in the
 * ActivityBar footer (Theme / DevTools actions) when "Show Labels" is enabled.
 * Mirrors the inactive AppModeButton styling so the whole bar reads as a
 * consistent labeled column (vertical bar) or row (horizontal bar).
 *
 * @param leftAlign - `true` for the vertical left/right bar (left-aligned,
 *   full width); `false` for the horizontal top/bottom bar (centered, auto
 *   width).
 * @param isActive - `true` when the action's target app is the active app, so
 *   the button shows the same highlight as a selected {@link AppModeButton}.
 */
export function activityBarLabelButtonClass(leftAlign: boolean, isActive = false): string {
  return cn(
    'relative flex items-center gap-1.5 rounded-lg h-9 px-3 transition-all duration-150',
    'cursor-pointer select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
    isActive
      ? 'bg-primary/15 text-primary border border-primary/50 shadow-sm hover:bg-primary/20 hover:text-primary'
      : 'text-muted-foreground/55 hover:bg-secondary hover:text-foreground/80 border border-transparent',
    leftAlign ? 'w-full justify-start' : 'justify-center',
  )
}
