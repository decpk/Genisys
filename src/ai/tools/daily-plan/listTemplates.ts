import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { ToolModule, ToolResult } from './tools.types'

const tool: ToolModule = {
  name: 'list_templates',
  definition: {
    type: 'function',
    function: {
      name: 'list_templates',
      description: 'List all available templates. Returns template details including name, type, and whether it is built-in.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useDailyPlanStore.getState()
    await store.loadTemplates()
    const templates = useDailyPlanStore.getState().templates || []
    if (templates.length === 0) {
      return { kind: 'success', message: 'No templates found.' }
    }
    const lines = templates.map((t) => {
      const builtIn = t.isBuiltIn ? 'Yes' : 'No'
      return `| ${t.name} | ${t.templateType} | ${builtIn} | ${t.id} |`
    })
    const message = [
      `**Templates** (${templates.length} total)`,
      '',
      '| Name | Type | Built-in | ID |',
      '|------|------|----------|----|',
      ...lines,
    ].join('\n')
    return { kind: 'success', message }
  },
}

export default tool
