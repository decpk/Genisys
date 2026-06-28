import { useDailyPlanStore } from '@/store/daily-plan-store'
import { generateId } from '@/components/DailyPlan/utils/generateId'
import type { ToolModule, ToolResult } from './tools.types'
import type { DPTemplate, DPTemplateContent } from '@/components/DailyPlan/DailyPlan.types'

const tool: ToolModule = {
  name: 'create_template',
  definition: {
    type: 'function',
    function: {
      name: 'create_template',
      description: 'Create a new daily plan template with predefined tasks, meetings, and status template.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Template name (required)' },
          description: { type: 'string', description: 'Template description' },
          templateType: {
            type: 'string',
            enum: ['student', 'professional', 'freelancer', 'custom'],
            description: 'Template type. Defaults to custom.',
          },
          tasks: {
            type: 'array',
            description: 'Array of task templates',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                scheduledTime: { type: 'string', description: 'HH:mm format' },
                durationMinutes: { type: 'number' },
                categoryId: { type: 'string' },
              },
              required: ['title'],
            },
          },
          meetings: {
            type: 'array',
            description: 'Array of meeting templates',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                startTime: { type: 'string', description: 'HH:mm format' },
                endTime: { type: 'string', description: 'HH:mm format' },
                location: { type: 'string' },
              },
              required: ['title', 'startTime', 'endTime'],
            },
          },
          statusTemplate: { type: 'string', description: 'A template for the daily status content' },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    if (!name?.trim()) {
      return { kind: 'error', message: 'Template name is required.' }
    }

    const templateContent: DPTemplateContent = {
      tasks: (args.tasks as DPTemplateContent['tasks']) || [],
      meetings: (args.meetings as DPTemplateContent['meetings']) || [],
      statusTemplate: (args.statusTemplate as string) || '',
    }

    const now = new Date().toISOString()
    const template: DPTemplate = {
      id: generateId('tmpl'),
      name: name.trim(),
      description: (args.description as string) || '',
      templateType: (args.templateType as DPTemplate['templateType']) || 'custom',
      content: JSON.stringify(templateContent),
      isBuiltIn: false,
      sortOrder: Date.now(),
      createdAt: now,
      updatedAt: now,
    }

    await useDailyPlanStore.getState().saveTemplate(template)
    return {
      kind: 'success',
      message: `✅ Template created: **${template.name}** (${template.templateType}) — ${templateContent.tasks.length} tasks, ${templateContent.meetings.length} meetings`,
    }
  },
}

export default tool
