import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'update_task',
  definition: {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Update an existing task. Only provided fields will be changed. Returns a summary of updated fields.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The task ID to update' },
          date: { type: 'string', description: 'The date (YYYY-MM-DD) the task is scheduled on' },
          title: { type: 'string', description: 'New task title' },
          description: { type: 'string', description: 'New task description' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'New priority level' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'completed'], description: 'New status' },
          scheduledTime: { type: 'string', description: 'New time in HH:mm format (24-hour)' },
          durationMinutes: { type: 'number', description: 'New duration in minutes' },
          categoryId: { type: 'string', description: 'New category ID' },
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

    const updatedFields: string[] = []
    const updated: DPTask = { ...task, updatedAt: new Date().toISOString() }

    if (args.title !== undefined) {
      updated.title = (args.title as string).trim()
      updatedFields.push(`title → "${updated.title}"`)
    }
    if (args.description !== undefined) {
      updated.description = args.description as string
      updatedFields.push('description')
    }
    if (args.priority !== undefined) {
      updated.priority = args.priority as DPTask['priority']
      updatedFields.push(`priority → ${updated.priority}`)
    }
    if (args.status !== undefined) {
      updated.status = args.status as DPTask['status']
      if (updated.status === 'completed') {
        updated.completedAt = new Date().toISOString()
      } else {
        updated.completedAt = null
      }
      updatedFields.push(`status → ${updated.status}`)
    }
    if (args.scheduledTime !== undefined) {
      const time = args.scheduledTime as string
      if (time && !/^\d{2}:\d{2}$/.test(time)) {
        return { kind: 'error', message: `Invalid time: "${time}". Use HH:mm.` }
      }
      updated.scheduledTime = time || null
      updatedFields.push(`time → ${updated.scheduledTime || 'cleared'}`)
    }
    if (args.durationMinutes !== undefined) {
      updated.durationMinutes = args.durationMinutes as number
      updatedFields.push(`duration → ${updated.durationMinutes}min`)
    }
    if (args.categoryId !== undefined) {
      updated.categoryId = (args.categoryId as string) || null
      updatedFields.push(`category → ${updated.categoryId || 'none'}`)
    }

    if (updatedFields.length === 0) {
      return { kind: 'success', message: 'No fields to update.' }
    }

    await useDailyPlanStore.getState().saveTask(updated)
    return {
      kind: 'success',
      message: `✅ Task "${updated.title}" updated: ${updatedFields.join(', ')}`,
    }
  },
}

export default tool
