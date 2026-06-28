import { useDailyPlanStore } from '@/store/daily-plan-store'
import { DailyPlanHeader } from '../DailyPlanHeader'
import { DayView } from '../DayView'
import { WeekView } from '../WeekView'
import { MonthView } from '../MonthView'
import { MotivationalQuote } from '../DayView/MotivationalQuote'

export function DailyPlanMainContent(): React.JSX.Element {
  const viewMode = useDailyPlanStore((s) => s.viewMode)

  let content: React.ReactNode
  if (viewMode === 'day') content = <DayView />
  else if (viewMode === 'week') content = <WeekView />
  else content = <MonthView />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DailyPlanHeader />
      <div className={viewMode === 'day' ? 'flex-1 overflow-y-auto px-6 py-4' : 'flex-1 overflow-hidden px-6 py-4'}>
        {content}
      </div>
      <MotivationalQuote />
    </div>
  )
}
