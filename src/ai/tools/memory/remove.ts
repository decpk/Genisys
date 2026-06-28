import { useAIMemoryStore, type AIMemoryScope } from '@/store/ai-memory-store'
import type { AIConfirmAction } from '@/right-panels/AIAssistantPanel'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'memory_delete',
  definition: {
    type: 'function',
    function: {
      name: 'memory_delete',
      description: 'Delete a memory file. Destructive — requires user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['user', 'session', 'repo'] },
          path: { type: 'string' },
        },
        required: ['scope', 'path'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const scope = args.scope as AIMemoryScope
    const path = args.path as string

    const file = useAIMemoryStore.getState().read(scope, path)
    if (!file) return { kind: 'error', message: `Memory file "${path}" does not exist in scope "${scope}".` }

    if (!ctx.confirmed) {
      const confirmAction: AIConfirmAction = {
        action: 'Delete memory file',
        description: `Delete \`${path}\` from \`${scope}\` memory?`,
        items: [{ path, type: 'memory-file' }],
        warning: 'This cannot be undone.',
      }
      return {
        kind: 'confirm-required',
        confirmAction,
        executeAfterConfirm: async () => {
          const result = useAIMemoryStore.getState().remove(scope, path)
          return result.ok ? `Deleted "${path}".` : (result.error ?? 'Delete failed.')
        },
      }
    }

    const result = useAIMemoryStore.getState().remove(scope, path)
    if (!result.ok) return { kind: 'error', message: result.error ?? 'Delete failed.' }
    return { kind: 'success', message: `Deleted "${path}" from scope "${scope}".` }
  },
}

export default tool
