import { useDailyPlanStore } from '@/store/daily-plan-store'
import { formatDate } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'reschedule_task',
  definition: {
    type: 'function',
    function: {
      name: 'reschedule_task',
      description: 'Reschedule a task to a new date and/or time. At least one of newDate or newTime must be provided.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The task ID to reschedule' },
          currentDate: { type: 'string', description: 'The current date (YYYY-MM-DD) the task is on' },
          newDate: { type: 'string', description: 'New date in YYYY-MM-DD format' },
          newTime: { type: 'string', description: 'New time in HH:mm format (24-hour)' },
        },
        required: ['taskId', 'currentDate'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const taskId = args.taskId as string
    const currentDate = args.currentDate as string
    const newDate = args.newDate as string | undefined
    const newTime = args.newTime as string | undefined

    if (!taskId || !currentDate) {
      return { kind: 'error', message: 'taskId and currentDate are required.' }
    }
    if (!newDate && newTime === undefined) {
      return { kind: 'error', message: 'At least one of newDate or newTime must be provided.' }
    }
    if (newDate && !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return { kind: 'error', message: `Invalid date: "${newDate}". Use YYYY-MM-DD.` }
    }
    if (newTime && !/^\d{2}:\d{2}$/.test(newTime)) {
      return { kind: 'error', message: `Invalid time: "${newTime}". Use HH:mm.` }
    }

    const store = useDailyPlanStore.getState()
    const tasks = store.tasks[currentDate] || []
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      return { kind: 'error', message: `Task "${taskId}" not found on ${currentDate}.` }
    }

    const updated = { ...task, updatedAt: new Date().toISOString() }
    const dateChanged = newDate && newDate !== currentDate

    if (newDate) {
      updated.scheduledDate = newDate
    }
    if (newTime !== undefined) {
      updated.scheduledTime = newTime || null
    }

    if (dateChanged) {
      await store.removeTask(taskId, currentDate)
    }
    await store.saveTask(updated)

    const parts: string[] = []
    if (dateChanged) parts.push(`date → ${formatDate(updated.scheduledDate)}`)
    if (newTime !== undefined) parts.push(`time → ${updated.scheduledTime || 'cleared'}`)

    return {
      kind: 'success',
      message: `✅ Task "${task.title}" rescheduled: ${parts.join(', ')}`,
    }
  },
}

export default tool
