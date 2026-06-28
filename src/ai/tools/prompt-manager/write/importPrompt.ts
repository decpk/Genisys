import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_import_prompt',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_import_prompt',
      description: 'Import a single prompt into a specific category and folder.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Prompt title' },
          content: { type: 'string', description: 'Prompt content' },
          categoryId: { type: 'string', description: 'Target category ID' },
          folderId: { type: 'string', description: 'Target folder ID' },
          description: { type: 'string', description: 'Prompt description (optional)' },
        },
        required: ['title', 'content', 'categoryId', 'folderId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const title = args.title as string
    const content = args.content as string
    const categoryId = args.categoryId as string
    const folderId = args.folderId as string
    const description = args.description as string | undefined
    if (!title) return { kind: 'error', message: 'title is required.' }
    if (!content) return { kind: 'error', message: 'content is required.' }
    if (!categoryId) return { kind: 'error', message: 'categoryId is required.' }
    if (!folderId) return { kind: 'error', message: 'folderId is required.' }

    const promptData = { title, content, description: description ?? '' }
    await usePromptManagerStore.getState().importPrompt(promptData as any, categoryId, folderId)
    return { kind: 'success', message: `✅ Prompt "${title}" imported into category ${categoryId}.` }
  },
}

export default tool
