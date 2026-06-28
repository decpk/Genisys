import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_update_environment',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_update_environment',
      description: 'Update an existing API environment name, base URL, description, or color.',
      parameters: {
        type: 'object',
        properties: {
          environmentId: { type: 'string', description: 'The environment ID to update' },
          name: { type: 'string', description: 'New name' },
          baseUrl: { type: 'string', description: 'New base URL' },
          description: { type: 'string', description: 'New description' },
          color: { type: 'string', description: 'New color' },
        },
        required: ['environmentId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const environmentId = args.environmentId as string
    if (!environmentId) {
      return { kind: 'error', message: 'environmentId is required.' }
    }

    const store = useApiClientStore.getState()
    const env = store.environments.find((e) => e.id === environmentId)
    if (!env) {
      return { kind: 'error', message: `Environment "${environmentId}" not found.` }
    }

    const updates: Record<string, unknown> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.baseUrl !== undefined) updates.baseUrl = args.baseUrl
    if (args.description !== undefined) updates.description = args.description
    if (args.color !== undefined) updates.color = args.color

    await store.updateEnvironment(environmentId, updates)
    return { kind: 'success', message: `✅ Environment "${env.name}" updated.` }
  },
}

export default tool
