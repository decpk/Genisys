import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { PromptScopeApp } from '@/lib/prompt-scope'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_create_prompt',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_create_prompt',
      description: 'Create a new prompt in a specific category and folder.',
      parameters: {
        type: 'object',
        properties: {
          categoryId: { type: 'string', description: 'The category ID for the prompt' },
          folderId: { type: 'string', description: 'The folder ID for the prompt' },
          title: { type: 'string', description: 'Prompt title' },
          content: { type: 'string', description: 'Prompt content' },
          description: { type: 'string', description: 'Prompt description (optional)' },
          appScopes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional app-view ids to restrict this prompt to (e.g. ["notes"]). Empty/omitted = visible in all apps.',
          },
        },
        required: ['categoryId', 'folderId', 'title', 'content'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const categoryId = args.categoryId as string
    const folderId = args.folderId as string
    const title = args.title as string
    const content = args.content as string
    const description = args.description as string | undefined
    const appScopes = args.appScopes as PromptScopeApp[] | undefined
    if (!categoryId) return { kind: 'error', message: 'categoryId is required.' }
    if (!folderId) return { kind: 'error', message: 'folderId is required.' }
    if (!title) return { kind: 'error', message: 'title is required.' }
    if (!content) return { kind: 'error', message: 'content is required.' }

    const prompt = await usePromptManagerStore.getState().addPrompt(categoryId, folderId, title, content, description, appScopes)
    return { kind: 'success', message: `✅ Prompt "${prompt.title}" created (id: ${prompt.id}).` }
  },
}

export default tool
