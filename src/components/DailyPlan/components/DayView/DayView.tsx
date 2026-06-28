import { useMemo } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { YesterdayReview } from './YesterdayReview'
import { TaskSection } from './TaskSection'
import { ReviewSection } from './ReviewSection'
import { MeetingSection } from './MeetingSection'
import { DayOverview } from './DayOverview'
import { UpcomingMeetingBanner } from './UpcomingMeetingBanner'
import { CarryOverBanner } from './CarryOverBanner'
import { getYesterday, isToday } from '../../utils/formatDate'
import { sortDPItems } from '../../utils/sortDPItems'
import { areAllComplete } from './utils/areAllComplete'
import type { DPTask, DPReview, DPMeeting } from '../../DailyPlan.types'

const EMPTY_TASKS: DPTask[] = []
const EMPTY_REVIEWS: DPReview[] = []
const EMPTY_MEETINGS: DPMeeting[] = []

export function DayView(): React.JSX.Element {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const tasks = useDailyPlanStore((s) => s.tasks)
  const reviews = useDailyPlanStore((s) => s.reviews)
  const meetings = useDailyPlanStore((s) => s.meetings)
  const dailyEntries = useDailyPlanStore((s) => s.dailyEntries)
  const taskSortBy = useDailyPlanStore((s) => s.taskSortBy)
  const taskSortDir = useDailyPlanStore((s) => s.taskSortDir)

  const dateTasks = tasks[selectedDate] || EMPTY_TASKS
  const dateReviews = reviews[selectedDate] || EMPTY_REVIEWS
  const dateMeetings = meetings[selectedDate] || EMPTY_MEETINGS
  const dailyEntry = dailyEntries[selectedDate]

  const activeTasks = useMemo(
    () => sortDPItems(dateTasks.filter((t) => t.status !== 'completed'), taskSortBy, taskSortDir),
    [dateTasks, taskSortBy, taskSortDir],
  )
  const completedTasks = useMemo(
    () => sortDPItems(dateTasks.filter((t) => t.status === 'completed'), taskSortBy, taskSortDir),
    [dateTasks, taskSortBy, taskSortDir],
  )
  const sortedReviews = useMemo(
    () => sortDPItems(dateReviews, taskSortBy, taskSortDir),
    [dateReviews, taskSortBy, taskSortDir],
  )

  const yesterday = getYesterday()
  const yesterdayTasks = tasks[yesterday] || EMPTY_TASKS
  const yesterdayCompleted = yesterdayTasks.filter((t) => t.status === 'completed')

  const allTasksComplete = areAllComplete(dateTasks, (t) => t.status === 'completed')
  const allMeetingsComplete = areAllComplete(dateMeetings, (m) => m.status === 'completed')
  const allReviewsComplete = areAllComplete(dateReviews, (r) => r.status === 'completed')

  return (
    <div className="space-y-5">
      {/* Upcoming meeting alert */}
      <UpcomingMeetingBanner meetings={dateMeetings} isToday={isToday(selectedDate)} />

      {/* Carry-over banner */}
      <CarryOverBanner />

      {/* Yesterday review banner */}
      <YesterdayReview completedTasks={yesterdayCompleted} />

      {/* Stats overview */}
      <DayOverview tasks={dateTasks} reviews={dateReviews} meetings={dateMeetings} dailyEntry={dailyEntry} />

      {/* Sections in order: Meetings, Tasks, Reviews, Completed */}
      <div className="space-y-6">
        <MeetingSection meetings={dateMeetings} allComplete={allMeetingsComplete} />
        <TaskSection title="Tasks" tasks={activeTasks} showQuickAdd allComplete={allTasksComplete} />
        <ReviewSection reviews={sortedReviews} allComplete={allReviewsComplete} />
        <TaskSection
          title="Completed"
          tasks={completedTasks}
          defaultCollapsed
          variant="completed"
        />
      </div>
    </div>
  )
}
