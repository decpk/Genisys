import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_list_environments',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_list_environments',
      description: 'List all API environments with their variables, base URL, and active status.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useApiClientStore.getState()
    if (!store.isLoaded) {
      await store.loadAll()
    }
    const { environments, activeEnvironmentId, environmentVariables } =
      useApiClientStore.getState()

    if (environments.length === 0) {
      return { kind: 'success', message: 'No environments found.' }
    }

    const sections = environments.map((env) => {
      const isActive = env.id === activeEnvironmentId
      const vars = environmentVariables[env.id] || []
      const varLines =
        vars.length > 0
          ? vars.map((v) => `  - \`${v.key}\` = ${v.isSecret ? '••••••' : v.value} ${v.enabled ? '' : '(disabled)'}`).join('\n')
          : '  (no variables)'

      return [
        `### ${env.name}${isActive ? ' ✅ (active)' : ''}`,
        `- **Base URL:** ${env.baseUrl || '(not set)'}`,
        `- **Color:** ${env.color || '—'}`,
        `- **ID:** ${env.id}`,
        `- **Variables:**`,
        varLines,
      ].join('\n')
    })

    const message = [`**Environments** (${environments.length})`, '', ...sections].join('\n\n')

    return { kind: 'success', message }
  },
}

export default tool
