import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'library_stop_generation',
  definition: {
    type: 'function',
    function: {
      name: 'library_stop_generation',
      description: 'Stop an ongoing book or chapter generation. Note: Generation control is managed through the UI.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    return {
      kind: 'success',
      message:
        '⚠️ Stopping generation requires the streaming UI pipeline (useBookGenerator hook) and cannot be controlled from the AI assistant. Please use the "Stop" button in the Library UI.',
    }
  },
}

export default tool
