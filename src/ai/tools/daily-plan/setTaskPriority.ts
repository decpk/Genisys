import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'set_task_priority',
  definition: {
    type: 'function',
    function: {
      name: 'set_task_priority',
      description: 'Set the priority level of a task.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The task ID to update' },
          date: { type: 'string', description: 'The date (YYYY-MM-DD) the task is scheduled on' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'New priority level' },
        },
        required: ['taskId', 'date', 'priority'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const taskId = args.taskId as string
    const date = args.date as string
    const priority = args.priority as DPTask['priority']
    if (!taskId || !date || !priority) {
      return { kind: 'error', message: 'taskId, date, and priority are required.' }
    }
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (!validPriorities.includes(priority)) {
      return { kind: 'error', message: `Invalid priority: "${priority}". Must be one of: ${validPriorities.join(', ')}` }
    }
    const tasks = useDailyPlanStore.getState().tasks[date] || []
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      return { kind: 'error', message: `Task "${taskId}" not found on ${date}.` }
    }
    const oldPriority = task.priority
    const updated = { ...task, priority, updatedAt: new Date().toISOString() }
    await useDailyPlanStore.getState().saveTask(updated)
    return {
      kind: 'success',
      message: `✅ Task "${task.title}" priority changed: ${oldPriority} → **${priority}**`,
    }
  },
}

export default tool
