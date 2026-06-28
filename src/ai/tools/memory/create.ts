import { useAIMemoryStore, type AIMemoryScope } from '@/store/ai-memory-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'memory_create',
  definition: {
    type: 'function',
    function: {
      name: 'memory_create',
      description:
        'Create a new memory file. Fails if the path already exists — use `memory_str_replace` or `memory_insert` to edit existing files. Use `user` scope for stable cross-session knowledge (auto-injected into every prompt), `session` for current-chat working notes, `repo` for workspace facts.',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['user', 'session', 'repo'] },
          path: { type: 'string', description: 'Slash-delimited path within the scope, e.g. "preferences/coding-style.md".' },
          content: { type: 'string', description: 'Initial content of the file.' },
        },
        required: ['scope', 'path', 'content'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const scope = args.scope as AIMemoryScope
    const path = args.path as string
    const content = args.content as string
    const result = useAIMemoryStore.getState().create(scope, path, content)
    if (!result.ok) return { kind: 'error', message: result.error ?? 'Create failed.' }
    return { kind: 'success', message: `Created memory file "${path}" in scope "${scope}".` }
  },
}

export default tool
