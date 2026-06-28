import { useMockServerStore } from '@/store/mock-server-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'mockserver_list_servers',
  definition: {
    type: 'function',
    function: {
      name: 'mockserver_list_servers',
      description:
        'List all mock servers, optionally filtered to a single project. Loads servers from the database if not already loaded.',
      parameters: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'Optional project ID to filter servers by',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const projectId = args.projectId as string | undefined
    const store = useMockServerStore.getState()
    if (store.servers.length === 0) {
      await store.loadServers()
    }
    // Sync running state from the backend so the reported running/stopped
    // status reflects the actual server processes (the store's cached
    // `runningServers` can be stale).
    await useMockServerStore.getState().refreshRunningServers()
    const { servers, runningServers } = useMockServerStore.getState()
    const filtered = projectId
      ? servers.filter((s) => s.project_id === projectId)
      : servers
    if (filtered.length === 0) {
      const scope = projectId ? ` for project \`${projectId}\`` : ''
      return { kind: 'success', message: `No mock servers found${scope}.` }
    }
    const runningIds = new Set(runningServers.map((r) => r.server_id))
    const lines = filtered.map((s) => {
      const running = runningIds.has(s.id) ? '🟢 running' : '⚪ stopped'
      return `- **${s.name}** (id: \`${s.id}\`, port: ${s.port}, project: \`${s.project_id}\`) — ${running}`
    })
    return {
      kind: 'success',
      message: `**Mock Servers (${filtered.length})**\n\n${lines.join('\n')}`,
    }
  },
}

export default tool
