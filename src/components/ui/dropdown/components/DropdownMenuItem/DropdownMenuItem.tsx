import { memo } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { DropdownMenuItemProps } from '../../Dropdown.types'

export const DropdownMenuItem = memo(function DropdownMenuItem({ item, showCheck, highlighted, onClose, onMouseEnter, keepOpenOnSelect }: DropdownMenuItemProps): React.JSX.Element {
  const { label, description, icon: Icon, endIcon: EndIcon, active, prefix, suffix, destructive, onSelect } = item
  const hasDescription = Boolean(description)

  const paddingClass = hasDescription ? 'py-1.5 items-start' : 'py-1 items-center'

  const activeClass = destructive
    ? highlighted
      ? 'bg-destructive/15 text-destructive'
      : 'bg-destructive/8 text-destructive hover:bg-destructive/15'
    : highlighted
      ? 'bg-secondary text-foreground'
      : active
        ? 'bg-secondary text-foreground'
        : 'text-popover-foreground hover:bg-secondary'

  const checkWidthClass = hasDescription ? 'w-4 mt-0.5' : 'w-3'

  const iconSize = hasDescription ? 14 : 12

  const iconColorClass = destructive
    ? 'text-destructive'
    : active
      ? 'text-primary'
      : 'text-muted-foreground'

  const endIconColorClass = destructive
    ? 'text-destructive'
    : active
      ? 'text-primary'
      : 'text-muted-foreground'

  const labelWeightClass = active ? 'font-medium' : ''

  const handleClick = () => {
    onSelect()
    const keepOpen = item.keepOpenOnSelect ?? keepOpenOnSelect
    if (!keepOpen) onClose()
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      data-key={item.key}
      className={cn('w-full flex gap-2 px-2.5 text-left transition-colors cursor-pointer', paddingClass, activeClass)}
    >
      {prefix}

      {Icon && (
        <Icon
          size={iconSize}
          className={cn('shrink-0', hasDescription && 'mt-0.5', iconColorClass)}
        />
      )}

      <div className="flex-1 min-w-0">
        <span className={cn('text-xs truncate block', labelWeightClass)}>{label}</span>
        {description && (
          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{description}</p>
        )}
      </div>

      {suffix}

      {EndIcon && <EndIcon size={12} className={cn('shrink-0', endIconColorClass)} />}

      {showCheck && (
        <span className={cn('shrink-0 flex justify-center', checkWidthClass)}>
          {active && <Check size={12} className="text-primary" />}
        </span>
      )}
    </button>
  )
}, (prev, next) =>
  prev.item.key === next.item.key &&
  prev.item.active === next.item.active &&
  prev.item.label === next.item.label &&
  prev.item.destructive === next.item.destructive &&
  prev.showCheck === next.showCheck &&
  prev.highlighted === next.highlighted
)
