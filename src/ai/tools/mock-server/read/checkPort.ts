import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_check_port',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_check_port',
      description:
        'Check whether a given TCP port is available for a mock server to bind to.',
      parameters: {
        type: 'object',
        properties: {
          port: { type: 'number', description: 'The port number to check (1024-65535)' },
        },
        required: ['port'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const port = args.port as number
    if (!port || typeof port !== 'number') {
      return { kind: 'error', message: 'port is required and must be a number.' }
    }
    const result = await window.api.mockCheckPort(port)
    if (result.available) {
      return { kind: 'success', message: `✅ Port **${port}** is available.` }
    }
    const reason = result.error ? ` (${result.error})` : ''
    return {
      kind: 'success',
      message: `⛔ Port **${port}** is **not available**${reason}.`,
    }
  },
}

export default tool
