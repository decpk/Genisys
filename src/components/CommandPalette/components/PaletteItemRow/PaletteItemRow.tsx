import { cn } from '@/lib/utils'

import { KIND_CONFIG } from '../../CommandPalette.constants'
import type { PaletteItemProps } from './PaletteItemRow.types'

export function PaletteItemRow(props: PaletteItemProps) {
  const { item, isSelected, onHover, onSelect } = props
  const kindConfig = KIND_CONFIG[item.kind]
  const Icon = item.icon ?? kindConfig.icon
  const iconColor = item.iconColor ?? kindConfig.iconColor

  const titleClass = isSelected ? 'text-accent-foreground' : 'text-foreground'
  const subtitleClass = isSelected ? 'text-accent-foreground/80' : 'text-muted-foreground'
  const badgeClass = isSelected
    ? 'border-accent-foreground/30 bg-accent-foreground/15 text-accent-foreground'
    : 'border-border bg-muted text-muted-foreground'
  const iconClass = isSelected ? 'text-accent-foreground' : iconColor

  let keybindingNode: React.ReactNode = null
  if (item.keybinding) {
    keybindingNode = (
      <kbd
        className={cn(
          'rounded border px-1.5 py-0.5 font-mono text-[10px]',
          badgeClass,
        )}
      >
        {item.keybinding}
      </kbd>
    )
  }

  let subtitleNode: React.ReactNode = null
  if (item.subtitle) {
    subtitleNode = <div className={cn('truncate text-xs', subtitleClass)}>{item.subtitle}</div>
  }

  return (
    <button
      type="button"
      onMouseMove={onHover}
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left',
        isSelected && 'bg-accent',
      )}
    >
      <Icon size={16} className={cn('shrink-0', iconClass)} />
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-sm font-medium', titleClass)}>{item.title}</div>
        {subtitleNode}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {keybindingNode}
        <span
          className={cn(
            'rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
            badgeClass,
          )}
        >
          {kindConfig.label}
        </span>
      </div>
    </button>
  )
}
