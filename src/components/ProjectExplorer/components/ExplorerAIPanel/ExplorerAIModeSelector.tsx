import { ChevronDown } from 'lucide-react'

import { Dropdown } from '@/components/ui/dropdown'
import { EXPLORER_AI_MODES, EXPLORER_AI_MODE_MAP } from './ExplorerAIMode.constants'
import type { ExplorerAIMode } from './ExplorerAIMode.constants'

interface ExplorerAIModeSelectorProps {
  selectedMode: ExplorerAIMode
  onModeChange: (mode: ExplorerAIMode) => void
}

export function ExplorerAIModeSelector({
  selectedMode,
  onModeChange,
}: ExplorerAIModeSelectorProps): React.JSX.Element {
  const selected = EXPLORER_AI_MODE_MAP[selectedMode]
  const Icon = selected.icon

  const items = EXPLORER_AI_MODES.map((mode) => ({
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
          <Icon size={12} />
          <span className="text-[10px] font-medium">{selected.label}</span>
          <ChevronDown size={9} />
        </button>
      }
    />
  )
}
