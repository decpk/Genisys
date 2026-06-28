import { usePromptManagerStore } from '@/store/prompt-manager-store'
import type { PmViewMode } from '@/store/prompt-manager-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const VALID_MODES: PmViewMode[] = ['folder', 'category', 'all']

const tool: ToolModule = {
  name: 'promptmanager_set_view_mode',
  definition: {
    type: 'function',
    function: {
      name: 'promptmanager_set_view_mode',
      description: 'Set the prompt manager view mode to folder, category, or all.',
      parameters: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['folder', 'category', 'all'], description: 'View mode to set' },
        },
        required: ['mode'],
      },
    },
  },
  execute: async (args, _ctx): Promise<ToolResult> => {
    const mode = args.mode as string
    if (!mode) return { kind: 'error', message: 'mode is required.' }
    if (!VALID_MODES.includes(mode as PmViewMode)) {
      return { kind: 'error', message: `Invalid mode "${mode}". Must be one of: ${VALID_MODES.join(', ')}.` }
    }

    usePromptManagerStore.getState().setViewMode(mode as PmViewMode)
    return { kind: 'success', message: `✅ View mode set to "${mode}".` }
  },
}

export default tool
