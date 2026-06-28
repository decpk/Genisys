import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { PmPrompt } from '@/store/prompt-manager-store'
import type { PromptScopeApp } from '@/lib/prompt-scope'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_update_prompt',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_update_prompt',
      description: 'Update a prompt title, content, and/or description.',
      parameters: {
        type: 'object',
        properties: {
          promptId: { type: 'string', description: 'The prompt ID to update' },
          title: { type: 'string', description: 'New prompt title' },
          content: { type: 'string', description: 'New prompt content' },
          description: { type: 'string', description: 'New prompt description' },
          appScopes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional app-view ids to restrict this prompt to (e.g. ["notes"]). Empty array = visible in all apps.',
          },
        },
        required: ['promptId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const promptId = args.promptId as string
    const title = args.title as string | undefined
    const content = args.content as string | undefined
    const description = args.description as string | undefined
    const appScopes = args.appScopes as PromptScopeApp[] | undefined
    if (!promptId) return { kind: 'error', message: 'promptId is required.' }

    const { prompts } = usePromptManagerStore.getState()
    const prompt = prompts.find((p) => p.id === promptId)
    if (!prompt) {
      return { kind: 'error', message: `Prompt "${promptId}" not found.` }
    }

    const updates: Partial<Pick<PmPrompt, 'title' | 'content' | 'description' | 'appScopes'>> = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (description !== undefined) updates.description = description
    if (appScopes !== undefined) updates.appScopes = appScopes.length > 0 ? appScopes : undefined

    if (Object.keys(updates).length === 0) {
      return { kind: 'error', message: 'Provide at least one field to update (title, content, description, or appScopes).' }
    }

    await usePromptManagerStore.getState().updatePrompt(promptId, updates)
    return { kind: 'success', message: `✅ Prompt "${prompt.title}" updated.` }
  },
}

export default tool
