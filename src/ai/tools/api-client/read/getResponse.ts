import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const MAX_BODY = 4000

const tool: ToolModule = {
  name: 'apiclient_get_response',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_get_response',
      description: 'Read the current active response — status, timing, size, headers, and body (truncated). Use this after sending a request to inspect the result.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const response = useApiClientStore.getState().activeResponse
    if (!response) {
      return { kind: 'error', message: 'There is no active response. Send a request first.' }
    }

    const body = response.body ?? ''
    const truncated = body.length > MAX_BODY
    const shownBody = truncated ? `${body.slice(0, MAX_BODY)}\n…[truncated ${body.length - MAX_BODY} chars]` : body

    const summary = {
      status: response.status,
      statusText: response.statusText,
      time: `${response.time}ms`,
      size: `${response.size} bytes`,
      headers: response.headers,
      body: shownBody,
    }

    return { kind: 'success', message: JSON.stringify(summary, null, 2) }
  },
}

export default tool
