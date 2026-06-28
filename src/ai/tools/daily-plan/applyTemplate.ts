import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '@/components/DailyPlan/utils/generateId'
import { getToday, formatDate } from '@/components/DailyPlan/utils/formatDate'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTemplateContent, DPTask, DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'apply_template',
  definition: {
    type: 'function',
    function: {
      name: 'apply_template',
      description: 'Apply a template to a specific date, creating all tasks and meetings defined in the template.',
      parameters: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'The template ID to apply' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format to apply the template to. Defaults to today.' },
        },
        required: ['templateId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const templateId = args.templateId as string
    const date = (args.date as string) || getToday()

    if (!templateId) {
      return { kind: 'error', message: 'templateId is required.' }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { kind: 'error', message: `Invalid date: "${date}". Use YYYY-MM-DD.` }
    }

    const store = useDailyPlanStore.getState()
    const template = store.templates.find((t) => t.id === templateId)
    if (!template) {
      return { kind: 'error', message: `Template "${templateId}" not found.` }
    }

    let content: DPTemplateContent
    try {
      content = JSON.parse(template.content) as DPTemplateContent
    } catch {
      return { kind: 'error', message: `Template "${template.name}" has invalid content.` }
    }

    const now = new Date().toISOString()
    let tasksCreated = 0
    let meetingsCreated = 0

    for (const taskDef of content.tasks || []) {
      const task: DPTask = {
        id: generateId('task'),
        title: taskDef.title,
        description: '',
        status: 'todo',
        priority: taskDef.priority || 'medium',
        categoryId: taskDef.categoryId || null,
        scheduledDate: date,
        scheduledTime: taskDef.scheduledTime || null,
        durationMinutes: taskDef.durationMinutes || 30,
        reminderAt: null,
        sortOrder: Date.now() + tasksCreated,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      await store.saveTask(task)
      tasksCreated++
    }

    for (const meetingDef of content.meetings || []) {
      const meeting: DPMeeting = {
        id: generateId('meeting'),
        title: meetingDef.title,
        description: '',
        scheduledDate: date,
        startTime: meetingDef.startTime,
        endTime: meetingDef.endTime,
        location: meetingDef.location || '',
        meetingLink: '',
        reminderAt: null,
        status: 'scheduled',
        meetingType: 'general',
        priority: 'medium',
        notes: '',
        followUp: '',
        agenda: '',
        outcome: '',
        attendees: '',
        cancelReason: '',
        sortOrder: Date.now() + meetingsCreated,
        createdAt: now,
        updatedAt: now,
      }
      await store.saveMeeting(meeting)
      meetingsCreated++
    }

    return {
      kind: 'success',
      message: `✅ Template "${template.name}" applied to ${formatDate(date)}: ${tasksCreated} tasks, ${meetingsCreated} meetings created`,
    }
  },
}

export default tool
