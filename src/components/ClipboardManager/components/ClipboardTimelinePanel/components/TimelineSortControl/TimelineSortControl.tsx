import { memo } from 'react'
import { Check, ArrowDown, ArrowUp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Tooltip } from '@/components/Tooltip'
import type { ClipboardTimelineSortDirection } from '@/store/settings-store'
import type { TimelineSortControlProps } from './TimelineSortControl.types'
import {
  SORT_TRIGGER,
  SORT_ITEM_LABEL,
  SORT_ITEM_CHECK,
  SORT_ITEM_CHECK_PLACEHOLDER,
} from './TimelineSortControl.styles'

const OPTIONS: Array<{
  value: ClipboardTimelineSortDirection
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { value: 'desc', label: 'Recent first', icon: ArrowDown },
  { value: 'asc', label: 'Oldest first', icon: ArrowUp },
]

export const TimelineSortControl = memo(function TimelineSortControl(
  props: TimelineSortControlProps,
): React.JSX.Element {
  const { value, onChange } = props

  const activeOption = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0]
  const ActiveIcon = activeOption.icon

  return (
    <DropdownMenu>
      <Tooltip content={`Sort: ${activeOption.label}`} side="bottom">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={SORT_TRIGGER}
            aria-label={`Sort timeline: ${activeOption.label}`}
          >
            <ActiveIcon className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = option.value === value
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(option.value)}
            >
              <Icon className="size-3.5" />
              <span className={SORT_ITEM_LABEL}>{option.label}</span>
              {isActive ? (
                <Check className={SORT_ITEM_CHECK} />
              ) : (
                <span className={SORT_ITEM_CHECK_PLACEHOLDER} aria-hidden />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

TimelineSortControl.displayName = 'TimelineSortControl'
