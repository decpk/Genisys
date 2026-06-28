import { Eye, EyeOff } from 'lucide-react'

import { ContextMenuItem } from '@/components/ui/context-menu'
import { useSettingsStore } from '@/store/settings-store'

/**
 * Context-menu item that toggles the Activity Bar's app labels on / off.
 * Mirrors {@link ActivityBarMoveMenuItems}: self-contained store wiring so it
 * can be dropped into both the bar's empty-area menu ({@link ActivityBar}) and
 * each app icon's menu ({@link AppModeButton}), keeping the labels reachable
 * even when icons fill the entire bar.
 */
export function ActivityBarLabelToggleItem(): React.JSX.Element {
  const showLabels = useSettingsStore((s) => s.showActivityBarLabels)
  const setShowActivityBarLabels = useSettingsStore((s) => s.setShowActivityBarLabels)

  return (
    <ContextMenuItem onClick={() => setShowActivityBarLabels(!showLabels)}>
      {showLabels ? <EyeOff size={14} /> : <Eye size={14} />}
      {showLabels ? 'Hide Labels' : 'Show Labels'}
    </ContextMenuItem>
  )
}
