import { useState, useCallback, useEffect, useMemo } from 'react'
import { format, parse } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '../../utils/generateId'
import { PRIORITY_CONFIG } from '../../constants'
import type { DPTask, DPPriority, DPTaskFormData } from '../../DailyPlan.types'
import { TaskFocusTimeSection } from './components/TaskFocusTimeSection'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTask?: DPTask | null
  defaultOverrides?: Partial<DPTaskFormData>
}

const PRIORITIES: DPPriority[] = ['low', 'medium', 'high', 'urgent']

function getDefaultFormData(selectedDate: string): DPTaskFormData {
  return {
    title: '',
    description: '',
    priority: 'medium',
    categoryId: null,
    scheduledDate: selectedDate,
    scheduledTime: null,
    durationMinutes: 30,
    reminderAt: null,
  }
}

export function TaskDialog({ open, onOpenChange, editTask, defaultOverrides }: TaskDialogProps): React.JSX.Element {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const categories = useDailyPlanStore((s) => s.categories)
  const saveTask = useDailyPlanStore((s) => s.saveTask)

  const [formData, setFormData] = useState<DPTaskFormData>(() =>
    getDefaultFormData(selectedDate),
  )

  useEffect(() => {
    if (open && editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        categoryId: editTask.categoryId,
        scheduledDate: editTask.scheduledDate,
        scheduledTime: editTask.scheduledTime,
        durationMinutes: editTask.durationMinutes,
        reminderAt: editTask.reminderAt,
      })
    } else if (open) {
      setFormData({ ...getDefaultFormData(selectedDate), ...defaultOverrides })
    }
  }, [open, editTask, selectedDate, defaultOverrides])

  const handleFieldChange = useCallback(
    (field: keyof DPTaskFormData, value: string | number | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.title.trim()) return

      const now = new Date().toISOString()
      const task: DPTask = {
        id: editTask?.id ?? generateId('task'),
        title: formData.title.trim(),
        description: formData.description,
        status: editTask?.status ?? 'todo',
        priority: formData.priority,
        categoryId: formData.categoryId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        durationMinutes: formData.durationMinutes,
        reminderAt: formData.reminderAt,
        sortOrder: editTask?.sortOrder ?? 0,
        completedAt: editTask?.completedAt ?? null,
        createdAt: editTask?.createdAt ?? now,
        updatedAt: now,
      }

      saveTask(task)
      onOpenChange(false)
    },
    [formData, editTask, saveTask, onOpenChange],
  )

  const isEditing = !!editTask
  const focusSection = isEditing && editTask ? (
    <TaskFocusTimeSection dailyPlanTaskId={editTask.id} />
  ) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the task details below.' : 'Add a new task to your daily plan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {focusSection}
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Task title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Optional description..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 resize-none"
              rows={3}
            />
            <p className="text-[11px] text-muted-foreground/70">
              Markdown supported — headings, lists, links, tables, and more.
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const isActive = formData.priority === p

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleFieldChange('priority', p)}
                    className={cn(
                      'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive && cfg.bgColor,
                      isActive && cfg.color,
                      isActive && 'border-current',
                      !isActive && 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label htmlFor="task-category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="task-category"
              value={formData.categoryId ?? ''}
              onChange={(e) =>
                handleFieldChange('categoryId', e.target.value || null)
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Date
              </label>
              <DatePicker
                value={parse(formData.scheduledDate, 'yyyy-MM-dd', new Date())}
                onChange={(date) => {
                  if (date) handleFieldChange('scheduledDate', format(date, 'yyyy-MM-dd'))
                }}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Time
              </label>
              <TimePicker
                value={formData.scheduledTime ? parse(formData.scheduledTime, 'HH:mm', new Date()) : undefined}
                onChange={(date) => handleFieldChange('scheduledTime', format(date, 'HH:mm'))}
              />
            </div>
          </div>

          {/* Duration and Reminder row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="task-duration" className="text-sm font-medium">
                Duration (min)
              </label>
              <Input
                id="task-duration"
                type="number"
                min={5}
                step={5}
                value={formData.durationMinutes}
                onChange={(e) =>
                  handleFieldChange('durationMinutes', parseInt(e.target.value, 10) || 30)
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Reminder
              </label>
              <DateTimePicker
                value={formData.reminderAt ? new Date(formData.reminderAt) : undefined}
                onChange={(date) => handleFieldChange('reminderAt', date ? date.toISOString() : null)}
                placeholder="Set reminder"
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Create Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
