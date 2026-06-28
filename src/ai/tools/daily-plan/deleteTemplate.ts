import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'delete_template',
  definition: {
    type: 'function',
    function: {
      name: 'delete_template',
      description: 'Delete a template by its ID. This is a destructive action that requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          templateId: { type: 'string', description: 'The template ID to delete' },
        },
        required: ['templateId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const templateId = args.templateId as string
    if (!templateId) {
      return { kind: 'error', message: 'templateId is required.' }
    }
    const templates = useDailyPlanStore.getState().templates
    const template = templates.find((t) => t.id === templateId)
    if (!template) {
      return { kind: 'error', message: `Template "${templateId}" not found.` }
    }
    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'delete_template',
          description: `Delete template: "${template.name}"`,
          items: [{ path: template.name, type: 'template', details: `${template.templateType} template` }],
          warning: `This will permanently delete the template "${template.name}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useDailyPlanStore.getState().removeTemplate(templateId)
          return `✅ Template "${template.name}" has been deleted.`
        },
      }
    }
    await useDailyPlanStore.getState().removeTemplate(templateId)
    return { kind: 'success', message: `✅ Template "${template.name}" has been deleted.` }
  },
}

export default tool
