import type { AISession } from '@/right-panels/AIAssistantPanel/AIAssistantPanel.types'
import type { ExplorerAISession } from '@/store/explorer-ai-history-store'

/**
 * Adapts an ExplorerAISession (superset) to the AISession shape
 * expected by the shared SessionItem component.
 */
export function toAISession(session: ExplorerAISession): AISession {
  return {
    id: session.id,
    title: session.title,
    updatedAt: session.updatedAt,
    status: session.status,
  }
}
