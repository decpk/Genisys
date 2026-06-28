import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'set_task_category',
  definition: {
    type: 'function',
    function: {
      name: 'set_task_category',
      description: 'Set or clear the category of a task. Pass categoryId as null or omit to clear.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The task ID to update' },
          date: { type: 'string', description: 'The date (YYYY-MM-DD) the task is scheduled on' },
          categoryId: { type: 'string', description: 'Category ID to assign, or null/omit to clear' },
        },
        required: ['taskId', 'date'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const taskId = args.taskId as string
    const date = args.date as string
    const categoryId = (args.categoryId as string) || null
    if (!taskId || !date) {
      return { kind: 'error', message: 'taskId and date are required.' }
    }
    const tasks = useDailyPlanStore.getState().tasks[date] || []
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      return { kind: 'error', message: `Task "${taskId}" not found on ${date}.` }
    }
    const updated = { ...task, categoryId, updatedAt: new Date().toISOString() }
    await useDailyPlanStore.getState().saveTask(updated)
    return {
      kind: 'success',
      message: categoryId
        ? `✅ Task "${task.title}" assigned to category "${categoryId}".`
        : `✅ Task "${task.title}" category cleared.`,
    }
  },
}

export default tool
