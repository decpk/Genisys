import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_remove_env_variable',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_remove_env_variable',
      description: 'Remove an environment variable from an API environment.',
      parameters: {
        type: 'object',
        properties: {
          variableId: { type: 'string', description: 'The variable ID to remove' },
          environmentId: { type: 'string', description: 'The environment ID the variable belongs to' },
        },
        required: ['variableId', 'environmentId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const variableId = args.variableId as string
    const environmentId = args.environmentId as string
    if (!variableId || !environmentId) {
      return { kind: 'error', message: 'variableId and environmentId are required.' }
    }

    const store = useApiClientStore.getState()
    await store.removeEnvironmentVariable(variableId, environmentId)

    return { kind: 'success', message: `✅ Environment variable "${variableId}" removed.` }
  },
}

export default tool
