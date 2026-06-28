import { memo } from 'react'

import { DropdownMenuItem } from '../DropdownMenuItem'

import type { DropdownMenuGroupProps } from '../../Dropdown.types'

export const DropdownMenuGroup = memo(function DropdownMenuGroup({
  group,
  showSeparator,
  showCheck,
  highlightedKey,
  onClose,
  onItemMouseEnter,
  keepOpenOnSelect,
}: DropdownMenuGroupProps): React.JSX.Element {
  return (
    <div>
      {showSeparator && <div className="h-px bg-border/40 mx-2 my-1" />}

      {group.label && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {group.icon && <group.icon size={10} className="shrink-0" />}
          {group.label}
        </div>
      )}

      {group.items.map((item) => (
        <DropdownMenuItem
          key={item.key}
          item={item}
          showCheck={showCheck}
          highlighted={highlightedKey === item.key}
          onClose={onClose}
          onMouseEnter={onItemMouseEnter ? () => onItemMouseEnter(item.key) : undefined}
          keepOpenOnSelect={keepOpenOnSelect}
        />
      ))}
    </div>
  )
})
