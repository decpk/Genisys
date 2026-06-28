import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'promptmanager_get_current_context',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_get_current_context',
      description: 'Get the current prompt manager UI context: active folder, category, prompt, view mode, and search query.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  execute: async (_args, _ctx): Promise<ToolResult> => {
    const { activeFolderId, activeCategoryId, activePromptId, viewMode, searchQuery } =
      usePromptManagerStore.getState()

    const result = { activeFolderId, activeCategoryId, activePromptId, viewMode, searchQuery }
    return { kind: 'success', message: JSON.stringify(result, null, 2) }
  },
}

export default tool
