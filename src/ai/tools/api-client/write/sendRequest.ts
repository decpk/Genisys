import { useApiClientStore } from '@/store/api-client-store'
import { executeRequest } from '@/components/APIClient/utils/request-executor'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'apiclient_send_request',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_send_request',
      description: 'Execute an API request over HTTP — same as clicking the Send button. Resolves environment variables, applies auth, sends via the Tauri backend, stores the response, and refreshes history. Returns the status, time, and size.',
      parameters: {
        type: 'object',
        properties: {
          requestId: { type: 'string', description: 'The request ID to send' },
        },
        required: ['requestId'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const requestId = args.requestId as string
    if (!requestId) {
      return { kind: 'error', message: 'requestId is required.' }
    }

    const store = useApiClientStore.getState()
    const request = store.requests.find((r) => r.id === requestId)
    if (!request) {
      return { kind: 'error', message: `Request "${requestId}" not found.` }
    }
    if (!request.url.trim()) {
      return { kind: 'error', message: `Request "${request.name}" has no URL set.` }
    }

    const activeEnvironmentId = store.activeEnvironmentId

    // Ensure environment variables are loaded for interpolation.
    let variables = activeEnvironmentId
      ? store.environmentVariables[activeEnvironmentId]
      : undefined
    if (activeEnvironmentId && variables === undefined) {
      await store.loadEnvironmentVariables(activeEnvironmentId)
      variables = useApiClientStore.getState().environmentVariables[activeEnvironmentId]
    }

    const activeEnv = activeEnvironmentId
      ? store.environments.find((e) => e.id === activeEnvironmentId)
      : undefined

    store.setActiveRequestId(requestId)
    store.setSendingFor(requestId, true)
    store.setResponseFor(requestId, null)

    try {
      const response = await executeRequest(request, {
        environmentId: activeEnvironmentId,
        variables: variables ?? [],
        baseUrl: activeEnv?.baseUrl,
      })
      store.setResponseFor(requestId, response)
      // Refresh history so the new entry shows up in the UI.
      store.loadHistory()

      const ok = response.status >= 200 && response.status < 400
      const icon = ok ? '✅' : '⚠️'
      return {
        kind: 'success',
        message: `${icon} ${request.method} ${request.name} → ${response.status} ${response.statusText} · ${response.time}ms · ${response.size} bytes.`,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { kind: 'error', message: `Request "${request.name}" failed: ${message}` }
    } finally {
      useApiClientStore.getState().setSendingFor(requestId, false)
    }
  },
}

export default tool
