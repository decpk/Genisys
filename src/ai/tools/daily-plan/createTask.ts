import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '@/components/DailyPlan/utils/generateId'
import { getToday, formatDate } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'create_task',
  definition: {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task. Returns the created task details. The task will appear immediately in the UI.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title (required)' },
          description: { type: 'string', description: 'Task description' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Priority level. Defaults to medium.' },
          scheduledDate: { type: 'string', description: 'Date in YYYY-MM-DD format. Defaults to today.' },
          scheduledTime: { type: 'string', description: 'Time in HH:mm format (24-hour). Optional.' },
          durationMinutes: { type: 'number', description: 'Duration in minutes. Defaults to 30.' },
          categoryId: { type: 'string', description: 'Category ID. Optional.' },
        },
        required: ['title'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const title = args.title as string
    if (!title?.trim()) {
      return { kind: 'error', message: 'Task title is required.' }
    }
    const scheduledDate = (args.scheduledDate as string) || getToday()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      return { kind: 'error', message: `Invalid date: "${scheduledDate}". Use YYYY-MM-DD.` }
    }

    // Deduplication: check if a task with the same title already exists on the target date
    const store = useDailyPlanStore.getState()
    if (!store.tasks[scheduledDate]) {
      await store.loadDataForDate(scheduledDate)
    }
    const existingTasks: DPTask[] = useDailyPlanStore.getState().tasks[scheduledDate] || []
    const trimmedTitle = title.trim().toLowerCase()
    const duplicate = existingTasks.find(
      (t) => t.title.trim().toLowerCase() === trimmedTitle,
    )
    if (duplicate) {
      return {
        kind: 'success',
        message: `Task already exists: **${duplicate.title}** (${duplicate.priority} priority, ${duplicate.status}) on ${formatDate(scheduledDate)}. No duplicate created.`,
      }
    }

    const now = new Date().toISOString()
    const task: DPTask = {
      id: generateId('task'),
      title: title.trim(),
      description: (args.description as string) || '',
      status: 'todo',
      priority: (args.priority as DPTask['priority']) || 'medium',
      categoryId: (args.categoryId as string) || null,
      scheduledDate,
      scheduledTime: (args.scheduledTime as string) || null,
      durationMinutes: (args.durationMinutes as number) || 30,
      reminderAt: null,
      sortOrder: Date.now(),
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    if (task.scheduledTime && !/^\d{2}:\d{2}$/.test(task.scheduledTime)) {
      return { kind: 'error', message: `Invalid time: "${task.scheduledTime}". Use HH:mm.` }
    }
    await useDailyPlanStore.getState().saveTask(task)
    return {
      kind: 'success',
      message: `✅ Task created: **${task.title}** on ${formatDate(task.scheduledDate)}${task.scheduledTime ? ` at ${task.scheduledTime}` : ''} (${task.priority} priority)`,
    }
  },
}

export default tool
