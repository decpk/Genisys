import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_suggest_port',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_suggest_port',
      description:
        'Suggest a free TCP port near a preferred value for a new mock server.',
      parameters: {
        type: 'object',
        properties: {
          preferred: {
            type: 'number',
            description: 'The preferred starting port to search from (default 3000)',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const preferred = (args.preferred as number) || 3000
    const result = await window.api.mockSuggestPort(preferred)
    if (result?.success && typeof result.port === 'number') {
      return {
        kind: 'success',
        message: `✅ Suggested free port: **${result.port}** (searched from ${preferred}).`,
      }
    }
    const reason = result?.error ? ` (${result.error})` : ''
    return {
      kind: 'error',
      message: `Could not find a free port near ${preferred}${reason}.`,
    }
  },
}

export default tool
