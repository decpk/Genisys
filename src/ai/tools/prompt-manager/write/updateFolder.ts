import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_update_folder',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_update_folder',
      description: 'Update a prompt manager folder name and/or color.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'The folder ID to update' },
          name: { type: 'string', description: 'New folder name' },
          color: { type: 'string', description: 'New folder color' },
        },
        required: ['folderId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const folderId = args.folderId as string
    const name = args.name as string | undefined
    const color = args.color as string | undefined
    if (!folderId) {
      return { kind: 'error', message: 'folderId is required.' }
    }

    const { folders } = usePromptManagerStore.getState()
    const folder = folders.find((f) => f.id === folderId)
    if (!folder) {
      return { kind: 'error', message: `Folder "${folderId}" not found.` }
    }

    const updates: Record<string, string> = {}
    if (name !== undefined) updates.name = name
    if (color !== undefined) updates.color = color

    if (Object.keys(updates).length === 0) {
      return { kind: 'error', message: 'Provide at least one field to update (name or color).' }
    }

    await usePromptManagerStore.getState().updateFolder(folderId, updates)
    return { kind: 'success', message: `✅ Folder "${folder.name}" updated.` }
  },
}

export default tool
