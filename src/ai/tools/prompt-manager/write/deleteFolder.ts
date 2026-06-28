import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_delete_folder',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_delete_folder',
      description: 'Delete a prompt manager folder. This is a destructive action requiring confirmation.',
      parameters: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'The folder ID to delete' },
        },
        required: ['folderId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const folderId = args.folderId as string
    if (!folderId) {
      return { kind: 'error', message: 'folderId is required.' }
    }

    const { folders } = usePromptManagerStore.getState()
    const folder = folders.find((f) => f.id === folderId)
    if (!folder) {
      return { kind: 'error', message: `Folder "${folderId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'promptmanager_delete_folder',
          description: `Delete folder: "${folder.name}"`,
          items: [{ path: folder.name, type: 'folder', details: `Color: ${folder.color}` }],
          warning: `This will permanently delete the folder "${folder.name}" and all its categories and prompts. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await usePromptManagerStore.getState().removeFolder(folderId)
          return `✅ Folder "${folder.name}" has been deleted.`
        },
      }
    }

    await usePromptManagerStore.getState().removeFolder(folderId)
    return { kind: 'success', message: `✅ Folder "${folder.name}" has been deleted.` }
  },
}

export default tool
