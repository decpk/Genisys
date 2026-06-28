import { useAIMemoryStore, type AIMemoryScope } from '@/store/ai-memory-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const SCOPE_DESC =
  'Memory scope: "user" (persists across sessions/workspaces — for stable preferences and patterns), "session" (current chat only — for working state), or "repo" (workspace-scoped facts).'

const tool: ToolModule = {
  name: 'memory_view',
  definition: {
    type: 'function',
    function: {
      name: 'memory_view',
      description:
        'View a memory file or list files in a scope. If `path` is omitted, returns the sorted list of paths in the scope. If `path` is provided, returns the file contents.',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['user', 'session', 'repo'], description: SCOPE_DESC },
          path: { type: 'string', description: 'Optional path within the scope (e.g. "preferences/style.md"). Omit to list all paths.' },
        },
        required: ['scope'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const scope = args.scope as AIMemoryScope
    const path = typeof args.path === 'string' ? args.path : undefined
    const store = useAIMemoryStore.getState()

    if (!path) {
      const paths = store.list(scope)
      if (paths.length === 0) return { kind: 'success', message: `Scope "${scope}" is empty.` }
      return { kind: 'success', message: `Scope "${scope}" contains ${paths.length} file(s):\n${paths.map((p) => `- ${p}`).join('\n')}` }
    }

    const file = store.read(scope, path)
    if (!file) return { kind: 'error', message: `Memory file "${path}" not found in scope "${scope}".` }
    return { kind: 'success', message: `# ${file.path} (updated ${file.updatedAt})\n\n${file.content}` }
  },
}

export default tool
