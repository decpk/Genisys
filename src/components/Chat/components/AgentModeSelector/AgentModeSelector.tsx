import { ChevronDown } from 'lucide-react'

import { Dropdown } from '@/components/ui/dropdown'
import { AGENT_MODES, AGENT_MODE_MAP } from './AgentModeSelector.constants'
import type { AgentModeSelectorProps } from './AgentModeSelector.types'

export function AgentModeSelector({
  selectedMode,
  onModeChange,
}: AgentModeSelectorProps): React.JSX.Element {
  const selected = AGENT_MODE_MAP[selectedMode]
  const Icon = selected.icon

  const items = AGENT_MODES.map((mode) => ({
    key: mode.id,
    label: mode.label,
    description: mode.description,
    icon: mode.icon,
    active: selectedMode === mode.id,
    onSelect: () => onModeChange(mode.id),
  }))

  return (
    <Dropdown
      openOn="click"
      items={items}
      side="top"
      align="left"
      menuWidth="fit-content"
      showCheck
      trigger={
        <button
          type="button"
          className="h-7 shrink-0 rounded-md flex items-center gap-1 px-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
        >
          <Icon size={14} />
          <span className="text-xs font-medium">{selected.label}</span>
          <ChevronDown size={10} />
        </button>
      }
    />
  )
}
