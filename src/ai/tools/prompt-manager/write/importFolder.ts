import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_import_folder',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_import_folder',
      description:
        'Import an entire folder with its categories and prompts. Expects a folderData object with folder, categories, prompts, and catMap properties.',
      parameters: {
        type: 'object',
        properties: {
          folderData: {
            type: 'object',
            description:
              'Object containing: folder (PmFolder), categories (PmCategory[]), prompts (PmPrompt[]), catMap (Record<oldCatId, newCatId>)',
          },
        },
        required: ['folderData'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const folderData = args.folderData as Record<string, unknown> | undefined
    if (!folderData) return { kind: 'error', message: 'folderData is required.' }

    const { folder, categories, prompts, catMap } = folderData as {
      folder?: unknown
      categories?: unknown
      prompts?: unknown
      catMap?: unknown
    }

    if (!folder || !categories || !prompts || !catMap) {
      return {
        kind: 'error',
        message:
          'folderData must include: folder (PmFolder object), categories (PmCategory[]), prompts (PmPrompt[]), catMap (Record<oldCatId, newCatId>). Please provide the complete structure.',
      }
    }

    // Dynamically import to avoid issues if store shape changes
    const { usePromptManagerStore } = await import('@/store/prompt-manager-store')
    await usePromptManagerStore.getState().importFolder(folder as any, categories as any, prompts as any, catMap as any)
    return { kind: 'success', message: `✅ Folder imported successfully.` }
  },
}

export default tool
