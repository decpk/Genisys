import { MiniCalendar } from './MiniCalendar'
import { CategoryList } from './CategoryList'
import { TemplateList } from './TemplateList'

export function DailyPlanSidebar(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full gap-6 p-4 overflow-y-auto">
      <MiniCalendar />
      <CategoryList />
      <TemplateList />
    </div>
  )
}
