import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_delete_prompt',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_delete_prompt',
      description: 'Delete a prompt. This is a destructive action requiring confirmation.',
      parameters: {
        type: 'object',
        properties: {
          promptId: { type: 'string', description: 'The prompt ID to delete' },
        },
        required: ['promptId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const promptId = args.promptId as string
    if (!promptId) return { kind: 'error', message: 'promptId is required.' }

    const { prompts } = usePromptManagerStore.getState()
    const prompt = prompts.find((p) => p.id === promptId)
    if (!prompt) {
      return { kind: 'error', message: `Prompt "${promptId}" not found.` }
    }

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'promptmanager_delete_prompt',
          description: `Delete prompt: "${prompt.title}"`,
          items: [{ path: prompt.title, type: 'prompt', details: prompt.description ?? '' }],
          warning: `This will permanently delete the prompt "${prompt.title}". This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await usePromptManagerStore.getState().removePrompt(promptId)
          return `✅ Prompt "${prompt.title}" has been deleted.`
        },
      }
    }

    await usePromptManagerStore.getState().removePrompt(promptId)
    return { kind: 'success', message: `✅ Prompt "${prompt.title}" has been deleted.` }
  },
}

export default tool
