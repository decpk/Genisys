import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_create_folder',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_create_folder',
      description: 'Create a new prompt manager folder.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Folder name' },
          color: { type: 'string', description: 'Folder color (optional)' },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const name = args.name as string
    const color = args.color as string | undefined
    if (!name) {
      return { kind: 'error', message: 'name is required.' }
    }

    const folder = await usePromptManagerStore.getState().addFolder(name, color)
    return { kind: 'success', message: `✅ Folder "${folder.name}" created (id: ${folder.id}).` }
  },
}

export default tool
