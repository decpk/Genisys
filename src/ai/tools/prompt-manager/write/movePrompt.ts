import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_move_prompt',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_move_prompt',
      description: 'Move a prompt to a different category and folder.',
      parameters: {
        type: 'object',
        properties: {
          promptId: { type: 'string', description: 'The prompt ID to move' },
          targetCategoryId: { type: 'string', description: 'The target category ID' },
          targetFolderId: { type: 'string', description: 'The target folder ID' },
        },
        required: ['promptId', 'targetCategoryId', 'targetFolderId'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const promptId = args.promptId as string
    const targetCategoryId = args.targetCategoryId as string
    const targetFolderId = args.targetFolderId as string
    if (!promptId) return { kind: 'error', message: 'promptId is required.' }
    if (!targetCategoryId) return { kind: 'error', message: 'targetCategoryId is required.' }
    if (!targetFolderId) return { kind: 'error', message: 'targetFolderId is required.' }

    const { prompts } = usePromptManagerStore.getState()
    const prompt = prompts.find((p) => p.id === promptId)
    if (!prompt) {
      return { kind: 'error', message: `Prompt "${promptId}" not found.` }
    }

    await usePromptManagerStore.getState().movePrompt(promptId, targetCategoryId, targetFolderId)
    return { kind: 'success', message: `✅ Prompt "${prompt.title}" moved to category ${targetCategoryId} in folder ${targetFolderId}.` }
  },
}

export default tool
