import { useWebLinksStore } from '@/store/weblinks-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'previewer_select_folder',
  definition: {
    type: 'function',
    function: {
      name: 'previewer_select_folder',
      description:
        "Set the active sidebar selection driving the collection grid: 'all', 'unfiled', or a folder id.",
      parameters: {
        type: 'object',
        properties: {
          selection: { type: 'string', description: "'all', 'unfiled', or a folder id." },
        },
        required: ['selection'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const selection = args.selection as string
    if (!selection) {
      return { kind: 'error', message: 'selection is required.' }
    }

    const store = useWebLinksStore.getState()

    let label: string
    if (selection === 'all') {
      label = 'All'
    } else if (selection === 'unfiled') {
      label = 'Unfiled'
    } else {
      const folder = store.folders.find((f) => f.id === selection)
      if (!folder) {
        return {
          kind: 'error',
          message: `Folder "${selection}" not found. Use 'all', 'unfiled', or a valid folder id.`,
        }
      }
      label = folder.name
    }

    store.selectFolder(selection)
    return { kind: 'success', message: `✅ Selected ${label}.` }
  },
}

export default tool
