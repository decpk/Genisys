import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'delete_task',
  definition: {
    type: 'function',
    function: {
      name: 'delete_task',
      description: 'Delete a task by its ID. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The task ID to delete' },
          date: { type: 'string', description: 'The date (YYYY-MM-DD) the task is scheduled on' },
        },
        required: ['taskId', 'date'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const taskId = args.taskId as string
    const date = args.date as string
    if (!taskId || !date) {
      return { kind: 'error', message: 'taskId and date are required.' }
    }
    const tasks = useDailyPlanStore.getState().tasks[date] || []
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      return { kind: 'error', message: `Task "${taskId}" not found on ${date}.` }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'delete_task',
          description: `Delete task: "${task.title}"`,
          items: [{ path: task.title, type: 'task', details: `${task.priority} priority, ${task.status}` }],
          warning: `This will permanently delete the task "${task.title}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useDailyPlanStore.getState().removeTask(taskId, date)
          return `✅ Task "${task.title}" has been deleted.`
        },
      }
    }
    await useDailyPlanStore.getState().removeTask(taskId, date)
    return { kind: 'success', message: `✅ Task "${task.title}" has been deleted.` }
  },
}

export default tool
