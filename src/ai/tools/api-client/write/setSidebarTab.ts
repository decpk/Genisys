import { useApiClientStore } from '@/store/api-client-store'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const VALID_TABS = ['collections', 'history', 'environments'] as const
type SidebarTab = (typeof VALID_TABS)[number]

const tool: ToolModule = {
  name: 'apiclient_set_sidebar_tab',
  definition: {
    type: 'function',
    function: {
      name: 'apiclient_set_sidebar_tab',
      description: 'Switch the API client sidebar tab to view collections, request history, or environments.',
      parameters: {
        type: 'object',
        properties: {
          tab: {
            type: 'string',
            enum: ['collections', 'history', 'environments'],
            description: 'The sidebar tab to show',
          },
        },
        required: ['tab'],
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const tab = args.tab as string
    if (!VALID_TABS.includes(tab as SidebarTab)) {
      return { kind: 'error', message: `Invalid tab "${tab}". Must be one of: ${VALID_TABS.join(', ')}.` }
    }

    useApiClientStore.getState().setSidebarTab(tab as SidebarTab)
    return { kind: 'success', message: `✅ Sidebar switched to "${tab}".` }
  },
}

export default tool
