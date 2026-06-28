import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  CalendarPlus,
  Check,
  CircleCheck,
  Clock,
  Flag,
  GripVertical,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { SORT_OPTIONS, SORT_DEFAULT_DIRECTION } from '../../constants'
import type { DPTaskSortBy } from '../../DailyPlan.types'

const SORT_ICONS: Record<string, LucideIcon> = {
  GripVertical,
  Flag,
  Clock,
  CalendarPlus,
  ArrowDownAZ,
  CircleCheck,
}

export function TaskSortMenu(): React.JSX.Element {
  const taskSortBy = useDailyPlanStore((s) => s.taskSortBy)
  const taskSortDir = useDailyPlanStore((s) => s.taskSortDir)
  const setTaskSortBy = useDailyPlanStore((s) => s.setTaskSortBy)
  const setTaskSortDir = useDailyPlanStore((s) => s.setTaskSortDir)

  const handleSelectSort = (sortBy: DPTaskSortBy): void => {
    setTaskSortBy(sortBy)
    // Apply the sensible default direction when switching to a new field.
    if (sortBy !== taskSortBy) {
      setTaskSortDir(SORT_DEFAULT_DIRECTION[sortBy])
    }
  }

  const toggleDirection = (): void => {
    setTaskSortDir(taskSortDir === 'asc' ? 'desc' : 'asc')
  }

  const directionDisabled = taskSortBy === 'manual'

  return (
    <DropdownMenu>
      <Tooltip content="Sort tasks & reviews">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm">
            <ArrowDownUp className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        {SORT_OPTIONS.map((option) => {
          const Icon = SORT_ICONS[option.icon] ?? ArrowDownUp
          const isActive = option.value === taskSortBy
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => handleSelectSort(option.value)}
            >
              <Icon className="size-3.5 opacity-70" />
              <span className="flex-1">{option.label}</span>
              {isActive && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={directionDisabled}
          onSelect={(e) => {
            e.preventDefault()
            toggleDirection()
          }}
        >
          {taskSortDir === 'asc' ? (
            <ArrowUp className="size-3.5 opacity-70" />
          ) : (
            <ArrowDown className="size-3.5 opacity-70" />
          )}
          <span className="flex-1">
            {taskSortDir === 'asc' ? 'Ascending' : 'Descending'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
