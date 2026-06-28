import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'
import { findTasksByIds } from './utils/task-details/findTasksByIds'
import { getAllLoadedTasks } from './utils/task-details/getAllLoadedTasks'
import { getUniqueTasksById } from './utils/task-details/getUniqueTasksById'

const tool: ToolModule = {
  name: 'get_task_details',
  definition: {
    type: 'function',
    function: {
      name: 'get_task_details',
      description:
        'Get complete task details for one or more task IDs, including description and all metadata fields.',
      parameters: {
        type: 'object',
        properties: {
          taskIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Task IDs to fetch full details for.',
          },
        },
        required: ['taskIds'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const rawTaskIds = args.taskIds as string[]
    if (!Array.isArray(rawTaskIds) || rawTaskIds.length === 0) {
      return { kind: 'error', message: 'taskIds must be a non-empty array of task IDs.' }
    }

    const taskIds = rawTaskIds
      .map((taskId) => (typeof taskId === 'string' ? taskId.trim() : ''))
      .filter((taskId) => taskId.length > 0)

    if (taskIds.length === 0) {
      return { kind: 'error', message: 'taskIds must contain at least one valid task ID string.' }
    }

    const store = useDailyPlanStore.getState()
    const loadedTasks = getAllLoadedTasks(store.tasks)
    const candidateTasks = getUniqueTasksById([...loadedTasks, ...(store.searchResults || [])])
    const foundTasks = findTasksByIds(candidateTasks, taskIds)

    if (foundTasks.length === 0) {
      return {
        kind: 'error',
        message: `No tasks found for IDs: ${taskIds.join(', ')}. Try using search_tasks first to discover valid IDs.`,
      }
    }

    const foundIds = new Set(foundTasks.map((task) => task.id))
    const missingTaskIds = taskIds.filter((taskId) => !foundIds.has(taskId))

    const messageParts: string[] = [
      `## Task details (${foundTasks.length}/${taskIds.length} found)`,
      '',
      '```json',
      JSON.stringify(foundTasks, null, 2),
      '```',
    ]

    if (missingTaskIds.length > 0) {
      messageParts.push('', `Missing task IDs: ${missingTaskIds.join(', ')}`)
    }

    return {
      kind: 'success',
      message: messageParts.join('\n'),
    }
  },
}

export default tool