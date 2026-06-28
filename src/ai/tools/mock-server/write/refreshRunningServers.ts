import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_refresh_running_servers',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_refresh_running_servers',
      description: 'Refresh the list of currently running mock servers.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async (): Promise<ToolResult> => {
    await useMockServerStore.getState().refreshRunningServers()
    const { runningServers } = useMockServerStore.getState()
    if (runningServers.length === 0) {
      return { kind: 'success', message: 'No servers are currently running.' }
    }
    const lines = runningServers.map(
      (s) => `- **${s.name}** (id: \`${s.server_id}\`, port: ${s.port})`
    )
    return {
      kind: 'success',
      message: `**Running Servers (${runningServers.length})**\n\n${lines.join('\n')}`,
    }
  },
}

export default tool
