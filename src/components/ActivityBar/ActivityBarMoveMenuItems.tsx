import { ContextMenuItem } from '@/components/ui/context-menu'
import { useSettingsStore } from '@/store/settings-store'

import { ACTIVITY_BAR_POSITION_ITEMS } from './ActivityBar.constants'

/**
 * Renders the "Move to {edge}" context-menu items for the Activity Bar,
 * excluding the current position. Shared between the bar's empty-area menu
 * ({@link ActivityBar}) and each app icon's menu ({@link AppModeButton}) so the
 * bar can be repositioned by right-clicking anywhere on it — even when the app
 * icons fill the entire bar and leave no empty space to click.
 */
export function ActivityBarMoveMenuItems(): React.JSX.Element {
  const position = useSettingsStore((s) => s.activityBarPosition)
  const setActivityBarPosition = useSettingsStore((s) => s.setActivityBarPosition)

  return (
    <>
      {ACTIVITY_BAR_POSITION_ITEMS.filter((item) => item.value !== position).map(
        ({ value, label, icon: Icon }) => (
          <ContextMenuItem key={value} onClick={() => setActivityBarPosition(value)}>
            <Icon size={14} />
            {label}
          </ContextMenuItem>
        ),
      )}
    </>
  )
}
