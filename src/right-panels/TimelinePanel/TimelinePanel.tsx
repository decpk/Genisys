import { HourlyTimeline } from '@/components/DailyPlan/components/DayView/HourlyTimeline'

import { useTimelinePanelData } from './useTimelinePanelData'

export function TimelinePanel(): React.JSX.Element {
  const { tasks, meetings, reviews } = useTimelinePanelData()

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden p-3 pt-0 mt-4">
      <HourlyTimeline tasks={tasks} meetings={meetings} reviews={reviews} />
    </div>
  );
}
