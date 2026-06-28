import { useCallback } from 'react'
import {
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CalendarClock,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate, addDays, getToday, isToday } from '../../utils/formatDate'
import type { DPViewMode } from '../../DailyPlan.types'
import { TaskDialog } from '../TaskDialog/TaskDialog'
import { MeetingDialog } from '../MeetingDialog/MeetingDialog'
import { TaskSortMenu } from './TaskSortMenu'

const VIEW_MODES: { value: DPViewMode; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

export function DailyPlanHeader(): React.JSX.Element {
  const taskDialogOpen = useDailyPlanStore((s) => s.taskDialogOpen)
  const setTaskDialogOpen = useDailyPlanStore((s) => s.setTaskDialogOpen)
  const meetingDialogOpen = useDailyPlanStore((s) => s.meetingDialogOpen)
  const setMeetingDialogOpen = useDailyPlanStore((s) => s.setMeetingDialogOpen)

  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const setSelectedDate = useDailyPlanStore((s) => s.setSelectedDate)
  const viewMode = useDailyPlanStore((s) => s.viewMode)
  const setViewMode = useDailyPlanStore((s) => s.setViewMode)
  const loadDataForDate = useDailyPlanStore((s) => s.loadDataForDate)

  const showTodayButton = !isToday(selectedDate)

  const handlePrevDay = useCallback(() => {
    const newDate = addDays(selectedDate, -1)
    setSelectedDate(newDate)
    loadDataForDate(newDate)
  }, [selectedDate, setSelectedDate, loadDataForDate])

  const handleNextDay = useCallback(() => {
    const newDate = addDays(selectedDate, 1)
    setSelectedDate(newDate)
    loadDataForDate(newDate)
  }, [selectedDate, setSelectedDate, loadDataForDate])

  const handleToday = useCallback(() => {
    const today = getToday()
    setSelectedDate(today)
    loadDataForDate(today)
  }, [setSelectedDate, loadDataForDate])

  const handleAddTask = useCallback(() => {
    setTaskDialogOpen(true)
  }, [setTaskDialogOpen])

  const handleAddMeeting = useCallback(() => {
    setMeetingDialogOpen(true)
  }, [setMeetingDialogOpen])

  return (
    <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
      {/* Left: Date navigation */}
      <div className="flex items-center gap-2">
        <Tooltip content="Previous day">
          <Button variant="ghost" size="icon-sm" onClick={handlePrevDay}>
            <ChevronLeft className="size-4" />
          </Button>
        </Tooltip>
        <span className="text-sm font-medium min-w-[180px] text-center">
          {formatDate(selectedDate)}
        </span>
        <Tooltip content="Next day">
          <Button variant="ghost" size="icon-sm" onClick={handleNextDay}>
            <ChevronRight className="size-4" />
          </Button>
        </Tooltip>
        {showTodayButton && (
          <Button variant="outline" size="sm" onClick={handleToday}>
            <CalendarCheck className="size-3.5" />
            Today
          </Button>
        )}
      </div>

      {/* Center: View mode tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as DPViewMode)}>
        <TabsList>
          {VIEW_MODES.map((mode) => (
            <TabsTrigger key={mode.value} value={mode.value}>
              {mode.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Right: Search, action buttons */}
      <div className="flex items-center gap-2">
        <TaskSortMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" />
              New
              <ChevronDown className="size-3 ml-0.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleAddTask}>
              <CheckSquare />
              Task
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleAddMeeting}>
              <CalendarClock />
              Meeting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
      <MeetingDialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen} />
    </div>
  )
}
