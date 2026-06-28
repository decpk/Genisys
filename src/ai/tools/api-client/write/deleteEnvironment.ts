import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_delete_environment',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_delete_environment',
      description: 'Delete an API environment and its variables. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          environmentId: { type: 'string', description: 'The environment ID to delete' },
        },
        required: ['environmentId'],
      },
    },
  },
  execute: async (args, ctx): Promise<ToolResult> => {
    const environmentId = args.environmentId as string
    if (!environmentId) {
      return { kind: 'error', message: 'environmentId is required.' }
    }

    const store = useApiClientStore.getState()
    const env = store.environments.find((e) => e.id === environmentId)
    if (!env) {
      return { kind: 'error', message: `Environment "${environmentId}" not found.` }
    }

    const varCount = (store.environmentVariables[environmentId] || []).length

    if (!ctx.confirmed) {
      return {
        kind: 'confirm-required',
        confirmAction: {
          action: 'apiclient_delete_environment',
          description: `Delete environment: "${env.name}"`,
          items: [{ path: env.name, type: 'environment', details: `${varCount} variables, base URL: ${env.baseUrl || '(none)'}` }],
          warning: `This will permanently delete the environment "${env.name}" and all its variables. This cannot be undone.`,
        },
        executeAfterConfirm: async () => {
          await useApiClientStore.getState().removeEnvironment(environmentId)
          return `✅ Environment "${env.name}" deleted.`
        },
      }
    }

    await store.removeEnvironment(environmentId)
    return { kind: 'success', message: `✅ Environment "${env.name}" deleted.` }
  },
}

export default tool
