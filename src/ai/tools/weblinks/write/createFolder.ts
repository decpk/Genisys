import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_create_folder',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_create_folder',
      description: 'Create a new folder for organizing saved previews.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the new folder.' },
          color: { type: 'string', description: 'Optional accent color (hex, e.g. "#4f46e5").' },
        },
        required: ['name'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const name = args.name as string
    if (!name) {
      return { kind: 'error', message: 'name is required.' }
    }
    const color = typeof args.color === 'string' ? args.color : undefined

    const folder = await useWebLinksStore.getState().createFolder(name, color)
    return { kind: 'success', message: `✅ Folder "${folder.name}" created (ID: ${folder.id}).` }
  },
}

export default tool
