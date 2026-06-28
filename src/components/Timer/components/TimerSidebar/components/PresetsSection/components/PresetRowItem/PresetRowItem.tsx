import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

import { PresetActions } from '../PresetActions'
import { PresetHoverCard } from '../PresetHoverCard'

import type { PresetRowItemProps } from './PresetRowItem.types'

export function PresetRowItem(props: PresetRowItemProps): React.JSX.Element {
  const { row, onSelect, onAction } = props
  const Icon = row.preset.icon

  return (
    <div className="group relative">
      <HoverCard openDelay={250} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            onClick={() => onSelect(row)}
            className="w-full flex items-center gap-2.5 text-left pl-2 pr-7 py-1.5 rounded-md text-sm text-foreground/80 hover:bg-card hover:text-foreground hover:shadow-sm transition-all"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Icon size={12} />
            </span>
            <span className="flex-1 min-w-0 truncate">{row.preset.label}</span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" className="w-80">
          <PresetHoverCard preset={row.preset} />
        </HoverCardContent>
      </HoverCard>
      <PresetActions row={row} onAction={onAction} />
    </div>
  )
}
