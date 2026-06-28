import { useAIMemoryStore, type AIMemoryScope } from '@/store/ai-memory-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'memory_str_replace',
  definition: {
    type: 'function',
    function: {
      name: 'memory_str_replace',
      description:
        'Replace an exact string in a memory file. The `old_str` must appear EXACTLY ONCE in the file — provide enough surrounding context to make it unique.',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['user', 'session', 'repo'] },
          path: { type: 'string' },
          old_str: { type: 'string', description: 'Exact text to find. Must appear exactly once.' },
          new_str: { type: 'string', description: 'Replacement text.' },
        },
        required: ['scope', 'path', 'old_str', 'new_str'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const scope = args.scope as AIMemoryScope
    const path = args.path as string
    const oldStr = args.old_str as string
    const newStr = args.new_str as string
    const result = useAIMemoryStore.getState().strReplace(scope, path, oldStr, newStr)
    if (!result.ok) return { kind: 'error', message: result.error ?? 'Replace failed.' }
    return { kind: 'success', message: `Updated "${path}" in scope "${scope}".` }
  },
}

export default tool
