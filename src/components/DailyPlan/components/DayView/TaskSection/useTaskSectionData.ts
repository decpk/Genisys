import { useState } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask } from '../../../DailyPlan.types'
import { generateId } from '../../../utils/generateId'
import { getTasksSubtitle } from '../shared/utils/getTasksSubtitle'
import { getCompletedSubtitle } from '../shared/utils/getCompletedSubtitle'
import { computeProgressPct } from './utils/computeProgressPct'
import { formatTaskCountLabel } from './utils/formatTaskCountLabel'
import { mapToSectionVariant } from './utils/mapToSectionVariant'
import type { TaskSectionVariant } from './TaskSection.types'
import type { SectionVariant } from '../shared/constants/sectionVariants.constants'
import {
  readSectionCollapsed,
  writeSectionCollapsed,
  type SectionCollapseKey,
} from "../shared/utils/sectionCollapseStorage";

interface UseTaskSectionDataArgs {
  tasks: DPTask[]
  defaultCollapsed: boolean
  variant: TaskSectionVariant
}

interface UseTaskSectionDataReturn {
  isCollapsed: boolean
  toggleCollapsed: () => void
  sectionVariant: SectionVariant
  subtitle: string
  countLabel: string
  progressPct: number
  showProgressBar: boolean
  quickAddValue: string
  setQuickAddValue: (value: string) => void
  handleQuickAddKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  editingTask: DPTask | null
  taskDialogOpen: boolean
  handleEditTask: (task: DPTask) => void
  handleTaskDialogClose: (open: boolean) => void
}

/**
 * Orchestrator hook for `TaskSection`. Owns:
 *   - collapse state
 *   - derived subtitle / count / progress
 *   - quick-add input state + keyboard handler
 *   - edit dialog state
 *
 * The view layer (`TaskSection.tsx`) only renders the returned values.
 */
export function useTaskSectionData(args: UseTaskSectionDataArgs): UseTaskSectionDataReturn {
  const { tasks, defaultCollapsed, variant } = args

  const collapseKey: SectionCollapseKey =
    variant === "completed" ? "tasks-completed" : "tasks-active";

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    readSectionCollapsed(collapseKey, defaultCollapsed),
  );
  const [quickAddValue, setQuickAddValue] = useState<string>('')
  const [editingTask, setEditingTask] = useState<DPTask | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false)

  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const saveTask = useDailyPlanStore((s) => s.saveTask)

  const sectionVariant = mapToSectionVariant(variant)

  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const activeCount = tasks.length - completedCount
  const progressPct = computeProgressPct(tasks.length, completedCount)

  let subtitle: string
  if (variant === 'completed') {
    subtitle = getCompletedSubtitle(tasks.length)
  } else {
    subtitle = getTasksSubtitle(activeCount, completedCount)
  }

  const countLabel = formatTaskCountLabel({
    variant,
    totalCount: tasks.length,
    completedCount,
  })

  const showProgressBar = variant === 'active' && tasks.length > 0 && !isCollapsed

  function toggleCollapsed() {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeSectionCollapsed(collapseKey, next);
      return next;
    });
  }

  function handleQuickAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const trimmed = quickAddValue.trim()
    if (!trimmed) return

    const now = new Date().toISOString()
    const newTask: DPTask = {
      id: generateId('task'),
      title: trimmed,
      description: '',
      status: 'todo',
      priority: 'medium',
      categoryId: null,
      scheduledDate: selectedDate,
      scheduledTime: null,
      durationMinutes: 30,
      reminderAt: null,
      sortOrder: tasks.length,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    saveTask(newTask)
    setQuickAddValue('')
  }

  function handleEditTask(task: DPTask) {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  function handleTaskDialogClose(open: boolean) {
    setTaskDialogOpen(open)
    if (!open) setEditingTask(null)
  }

  return {
    isCollapsed,
    toggleCollapsed,
    sectionVariant,
    subtitle,
    countLabel,
    progressPct,
    showProgressBar,
    quickAddValue,
    setQuickAddValue,
    handleQuickAddKeyDown,
    editingTask,
    taskDialogOpen,
    handleEditTask,
    handleTaskDialogClose,
  }
}
