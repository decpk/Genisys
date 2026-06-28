import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_set_active_environment',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_set_active_environment',
      description: 'Set the active API environment, or pass null to deactivate all environments.',
      parameters: {
        type: 'object',
        properties: {
          environmentId: { type: ['string', 'null'], description: 'The environment ID to activate, or null to deactivate' },
        },
        required: ['environmentId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const environmentId = (args.environmentId as string | null) ?? null

    const store = useApiClientStore.getState()

    if (environmentId !== null) {
      const env = store.environments.find((e) => e.id === environmentId)
      if (!env) {
        return { kind: 'error', message: `Environment "${environmentId}" not found.` }
      }
      store.setActiveEnvironment(environmentId)
      return { kind: 'success', message: `✅ Active environment set to "${env.name}".` }
    }

    store.setActiveEnvironment(null)
    return { kind: 'success', message: '✅ Active environment cleared.' }
  },
}

export default tool
