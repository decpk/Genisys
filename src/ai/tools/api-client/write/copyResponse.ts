import { useApiClientStore } from '@/store/api-client-store'
import { formatResponseBody } from '@/components/APIClient/utils/format-response'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

function findContentType(headers: Record<string, string> | undefined): string | undefined {
  if (!headers) return undefined
  const key = Object.keys(headers).find((k) => k.toLowerCase() === 'content-type')
  return key ? headers[key] : undefined
}

const tool: ToolModule = {
  name: 'apiclient_copy_response',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_copy_response',
      description: 'Copy the current active response body to the system clipboard, formatted the same way as the response viewer Copy button.',
      parameters: { type: 'object', properties: {} },
    },
  },
  execute: async (): Promise<ToolResult> => {
    const store = useApiClientStore.getState()
    const response = store.activeResponse
    if (!response) {
      return { kind: 'error', message: 'There is no active response to copy.' }
    }
    if (!response.body) {
      return { kind: 'error', message: 'The active response has an empty body.' }
    }

    const contentType = findContentType(response.headers)
    const formatted = formatResponseBody(response.body, contentType)

    try {
      await navigator.clipboard.writeText(formatted)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { kind: 'error', message: `Failed to copy to clipboard: ${message}` }
    }

    return {
      kind: 'success',
      message: `✅ Copied the response body (${formatted.length} chars) to the clipboard.`,
    }
  },
}

export default tool
