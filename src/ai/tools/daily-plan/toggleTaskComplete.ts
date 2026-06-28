import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'toggle_task_complete',
  definition: {
    type: 'function',
    function: {
      name: 'toggle_task_complete',
      description: 'Toggle a task between completed and todo status.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The task ID to toggle' },
          date: { type: 'string', description: 'The date (YYYY-MM-DD) the task is scheduled on' },
        },
        required: ['taskId', 'date'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
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
    await useDailyPlanStore.getState().toggleTaskComplete(task)
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    return {
      kind: 'success',
      message: `✅ Task "${task.title}" marked as **${newStatus}**.`,
    }
  },
}

export default tool
