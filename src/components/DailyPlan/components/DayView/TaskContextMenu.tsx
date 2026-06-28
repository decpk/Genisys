import {
  Pencil,
  Copy,
  ArrowRight,
  Flag,
  FolderOpen,
  Timer as TimerIcon,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useNavigationStore } from '@/store/navigation-store'
import type { DPTask, DPPriority, DPCategory } from '../../DailyPlan.types'
import { PRIORITY_CONFIG } from '../../constants'
import { getToday, getTomorrow } from '../../utils/formatDate'
import { buildMoveTargetDates } from '../../utils/buildMoveTargetDates'
import { moveTaskToDate } from '../../utils/moveTaskToDate'
import { generateId } from '../../utils/generateId'
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog'
import { useDailyPlanConfirmation } from '@/hooks/useDailyPlanConfirmation'

const PRIORITIES: DPPriority[] = ['urgent', 'high', 'medium', 'low']

const PRIORITY_DOT: Record<DPPriority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}

/* ── Shared menu items rendered for both ContextMenu and DropdownMenu ── */

interface MenuItemsProps {
  task: DPTask
  categories: DPCategory[]
  onEdit: () => void
  onDuplicate: () => void
  onMoveToToday: () => void
  onMoveToTomorrow: () => void
  onChangePriority: (p: DPPriority) => void
  onChangeCategory: (id: string | null) => void
  onStartTimer: () => void
  onDelete: () => void
  variant: 'context' | 'dropdown'
  todayLabel: string
  tomorrowLabel: string
  isToday: boolean
  isTomorrow: boolean
}

function TaskMenuItems({
  task,
  categories,
  onEdit,
  onDuplicate,
  onMoveToToday,
  onMoveToTomorrow,
  onChangePriority,
  onChangeCategory,
  onStartTimer,
  onDelete,
  variant,
  todayLabel,
  tomorrowLabel,
  isToday,
  isTomorrow,
}: MenuItemsProps): React.JSX.Element {
  const Item = variant === 'context' ? ContextMenuItem : DropdownMenuItem
  const Separator = variant === 'context' ? ContextMenuSeparator : DropdownMenuSeparator
  const Sub = variant === 'context' ? ContextMenuSub : DropdownMenuSub
  const SubTrigger = variant === 'context' ? ContextMenuSubTrigger : DropdownMenuSubTrigger
  const SubContent = variant === 'context' ? ContextMenuSubContent : DropdownMenuSubContent

  return (
    <>
      <Item onClick={onEdit}>
        <Pencil size={15} />
        Edit
      </Item>
      <Item onClick={onDuplicate}>
        <Copy size={15} />
        Duplicate
      </Item>
      {!isToday && (
        <Item onClick={onMoveToToday}>
          <ArrowRight size={15} />
          {`Move to Today \u2014 ${todayLabel}`}
        </Item>
      )}
      {!isTomorrow && (
        <Item onClick={onMoveToTomorrow}>
          <ArrowRight size={15} />
          {`Move to Tomorrow \u2014 ${tomorrowLabel}`}
        </Item>
      )}
      <Item onClick={onStartTimer}>
        <TimerIcon size={15} />
        Start Timer for this task
      </Item>

      <Separator />

      <Sub>
        <SubTrigger>
          <Flag size={15} />
          Priority
        </SubTrigger>
        <SubContent>
          {PRIORITIES.map((p) => {
            const cfg = PRIORITY_CONFIG[p]
            const isActive = task.priority === p
            return (
              <Item
                key={p}
                onClick={() => onChangePriority(p)}
                className={isActive ? 'font-semibold' : ''}
              >
                <span className={`size-2 rounded-full shrink-0 ${PRIORITY_DOT[p]}`} />
                {cfg.label}
                {isActive && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </Item>
            )
          })}
        </SubContent>
      </Sub>

      {categories.length > 0 && (
        <Sub>
          <SubTrigger>
            <FolderOpen size={15} />
            Category
          </SubTrigger>
          <SubContent>
            <Item
              onClick={() => onChangeCategory(null)}
              className={!task.categoryId ? 'font-semibold' : ''}
            >
              No category
              {!task.categoryId && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </Item>
            <Separator />
            {categories.map((cat) => {
              const isActive = task.categoryId === cat.id
              return (
                <Item
                  key={cat.id}
                  onClick={() => onChangeCategory(cat.id)}
                  className={isActive ? 'font-semibold' : ''}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                  {isActive && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </Item>
              )
            })}
          </SubContent>
        </Sub>
      )}

      <Separator />

      <Item onClick={onDelete} className="text-destructive">
        <Trash2 size={15} className="text-destructive" />
        Delete
      </Item>
    </>
  )
}

/* ── TaskContextMenu: wraps children in right-click context menu ── */

interface TaskContextMenuProps {
  task: DPTask
  children: React.ReactNode
  onEdit: (task: DPTask) => void
}

export function TaskContextMenu({ task, children, onEdit }: TaskContextMenuProps): React.JSX.Element {
  const saveTask = useDailyPlanStore((s) => s.saveTask)
  const removeTask = useDailyPlanStore((s) => s.removeTask)
  const categories = useDailyPlanStore((s) => s.categories)
  
  const confirmation = useDailyPlanConfirmation()

  const handleDeleteClick = () => {
    confirmation.openConfirmation(
      'Delete Task',
      'Are you sure you want to delete',
      task.title,
      async () => {
        await removeTask(task.id, task.scheduledDate)
      },
      []
    )
  }

  const actions = useTaskActions(task, saveTask, removeTask, () => onEdit(task), handleDeleteClick)
  const moveTargets = buildMoveTargetDates(task.scheduledDate)

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={confirmation.isOpen}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        title={confirmation.title}
        description={confirmation.description}
        itemName={confirmation.itemName}
        warnings={confirmation.warnings}
        isLoading={confirmation.isLoading}
      />
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <TaskMenuItems task={task} categories={categories} variant="context" {...actions} {...moveTargets} />
        </ContextMenuContent>
      </ContextMenu>
    </>
  )
}

/* ── TaskDropdownMenu: 3-dot vertical button that opens dropdown ── */

interface TaskDropdownMenuProps {
  task: DPTask
  onEdit: (task: DPTask) => void
  className?: string
}

export function TaskDropdownMenu({ task, onEdit, className }: TaskDropdownMenuProps): React.JSX.Element {
  const saveTask = useDailyPlanStore((s) => s.saveTask)
  const removeTask = useDailyPlanStore((s) => s.removeTask)
  const categories = useDailyPlanStore((s) => s.categories)
  
  const confirmation = useDailyPlanConfirmation()

  const handleDeleteClick = () => {
    confirmation.openConfirmation(
      'Delete Task',
      'Are you sure you want to delete',
      task.title,
      async () => {
        await removeTask(task.id, task.scheduledDate)
      },
      []
    )
  }

  const actions = useTaskActions(task, saveTask, removeTask, () => onEdit(task), handleDeleteClick)
  const moveTargets = buildMoveTargetDates(task.scheduledDate)

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={confirmation.isOpen}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        title={confirmation.title}
        description={confirmation.description}
        itemName={confirmation.itemName}
        warnings={confirmation.warnings}
        isLoading={confirmation.isLoading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <TaskMenuItems task={task} categories={categories} variant="dropdown" {...actions} {...moveTargets} />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

/* ── Shared action handlers ── */

function useTaskActions(
  task: DPTask,
  saveTask: (t: DPTask) => void,
  removeTask: (id: string, date: string) => void,
  onEdit: () => void,
  onDelete: () => void,
) {
  return {
    onEdit,
    onDuplicate() {
      const now = new Date().toISOString()
      saveTask({
        ...task,
        id: generateId('task'),
        title: `${task.title} (copy)`,
        status: 'todo',
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      })
    },
    onMoveToToday() {
      saveTask(moveTaskToDate(task, getToday()))
    },
    onMoveToTomorrow() {
      saveTask(moveTaskToDate(task, getTomorrow()))
    },
    onChangePriority(priority: DPPriority) {
      const now = new Date().toISOString()
      saveTask({ ...task, priority, updatedAt: now })
    },
    onChangeCategory(categoryId: string | null) {
      const now = new Date().toISOString()
      saveTask({ ...task, categoryId, updatedAt: now })
    },
    onStartTimer() {
      useNavigationStore.getState().openTimerForTask(task.id, task.title)
    },
    onDelete,
  }
}
