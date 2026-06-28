import { useAIMemoryStore, type AIMemoryScope } from '@/store/ai-memory-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'memory_rename',
  definition: {
    type: 'function',
    function: {
      name: 'memory_rename',
      description: 'Rename or move a memory file within the same scope.',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['user', 'session', 'repo'] },
          from_path: { type: 'string' },
          to_path: { type: 'string' },
        },
        required: ['scope', 'from_path', 'to_path'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const scope = args.scope as AIMemoryScope
    const fromPath = args.from_path as string
    const toPath = args.to_path as string
    const result = useAIMemoryStore.getState().rename(scope, fromPath, toPath)
    if (!result.ok) return { kind: 'error', message: result.error ?? 'Rename failed.' }
    return { kind: 'success', message: `Renamed "${fromPath}" → "${toPath}" in scope "${scope}".` }
  },
}

export default tool
