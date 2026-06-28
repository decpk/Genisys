import { ListChecks, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskSection/TaskCard'
import { TaskDialog } from '../TaskDialog/TaskDialog'
import { useTaskSectionData } from './TaskSection/useTaskSectionData'
import type { TaskSectionProps } from './TaskSection/TaskSection.types'
import { SectionShell } from './shared/SectionShell'
import { SectionHeader } from './shared/SectionHeader'
import { SectionProgressBar } from './shared/SectionProgressBar'
import { SectionActionsMenu } from './shared/SectionActionsMenu'
import { moveTaskToDate } from '../../utils/moveTaskToDate'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask } from '../../DailyPlan.types'
import { taskSectionStyles as s } from './TaskSection.styles'

export function TaskSection(props: TaskSectionProps): React.JSX.Element {
  const {
    title,
    tasks,
    showQuickAdd,
    defaultCollapsed,
    variant = 'active',
    allComplete,
  } = props
  const data = useTaskSectionData({
    tasks,
    defaultCollapsed: defaultCollapsed ?? false,
    variant,
  })
  const saveTask = useDailyPlanStore((s) => s.saveTask)

  const progressBar = data.showProgressBar
    ? <SectionProgressBar percent={data.progressPct} />
    : null

  const isCompletedVariant = variant === 'completed'
  const cardListClass = cn(s.cardList, isCompletedVariant && s.cardListCompletedMask)

  let menu: React.ReactNode = null
  if (!isCompletedVariant) {
    menu = (
      <SectionActionsMenu<DPTask>
        items={tasks}
        itemNoun="task"
        sectionTitle={title}
        moveItem={moveTaskToDate}
        saveItem={saveTask}
        getIsCompleted={(t) => t.status === 'completed'}
      />
    )
  }

  const emptyState = (
    <div className={s.emptyContainer}>
      <ListChecks className={s.emptyIcon} />
      <p className={s.emptyText}>No tasks yet</p>
    </div>
  )

  const showQuickAddInput = showQuickAdd && !isCompletedVariant

  let body: React.ReactNode = null
  if (!data.isCollapsed) {
    body = (
      <div className={cardListClass}>
        {tasks.length === 0 && emptyState}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={data.handleEditTask} />
        ))}
        {showQuickAddInput && (
          <div className={s.quickAddContainer}>
            <Plus className={s.quickAddIcon} />
            <input
              type="text"
              value={data.quickAddValue}
              onChange={(e) => data.setQuickAddValue(e.target.value)}
              onKeyDown={data.handleQuickAddKeyDown}
              placeholder="Add a task..."
              className={s.quickAddInput}
            />
            <span className={s.quickAddHint}>
              <kbd className={s.quickAddKbd}>Enter</kbd>
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <SectionShell variant={data.sectionVariant}>
      <SectionHeader
        variant={data.sectionVariant}
        title={title}
        subtitle={data.subtitle}
        countLabel={data.countLabel}
        collapsed={data.isCollapsed}
        allComplete={allComplete}
        onToggle={data.toggleCollapsed}
        rightSlot={progressBar}
        menuSlot={menu}
      />
      {body}
      <TaskDialog
        open={data.taskDialogOpen}
        onOpenChange={data.handleTaskDialogClose}
        editTask={data.editingTask}
      />
    </SectionShell>
  )
}
