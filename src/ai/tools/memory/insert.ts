import { useAIMemoryStore, type AIMemoryScope } from '@/store/ai-memory-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'memory_insert',
  definition: {
    type: 'function',
    function: {
      name: 'memory_insert',
      description:
        'Insert a line of text at a specific 0-based line number in a memory file. Use line=0 to prepend at the start.',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['user', 'session', 'repo'] },
          path: { type: 'string' },
          line: { type: 'number', description: '0-based line index where the new text will be inserted.' },
          text: { type: 'string', description: 'Text to insert (will become a new line).' },
        },
        required: ['scope', 'path', 'line', 'text'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const scope = args.scope as AIMemoryScope
    const path = args.path as string
    const line = args.line as number
    const text = args.text as string
    const result = useAIMemoryStore.getState().insert(scope, path, line, text)
    if (!result.ok) return { kind: 'error', message: result.error ?? 'Insert failed.' }
    return { kind: 'success', message: `Inserted line ${line} into "${path}".` }
  },
}

export default tool
