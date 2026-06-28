import { LayoutGrid } from 'lucide-react'

import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import { VIEW_MODE_CONFIG } from './ViewModes/ViewModes.constants'
import type { ViewMode } from './ViewModes/ViewModes.types'

interface ViewModeSwitcherProps {
  activeMode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

export function ViewModeSwitcher({
  activeMode,
  onModeChange
}: ViewModeSwitcherProps): React.JSX.Element {
  const active = VIEW_MODE_CONFIG.find((c) => c.mode === activeMode)
  const ActiveIcon = active?.icon ?? LayoutGrid

  const items: DropdownItem[] = VIEW_MODE_CONFIG.map(({ mode, label, icon, description }) => ({
    key: mode,
    label,
    description,
    icon,
    active: activeMode === mode,
    onSelect: () => onModeChange(mode),
  }))

  return (
    <Dropdown
      openOn="click"
      items={items}
      align="right"
      menuWidth="288px"
      trigger={
        <button className="flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors cursor-pointer text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ActiveIcon size={12} />
          <span>{active?.label ?? 'View'}</span>
        </button>
      }
    />
  )
}
