import type { ToolActivityRendererMode } from '@/lib/chat-ui'

import type { AIToolActivity } from '../AIAssistantPanel.types'

export interface ToolActivityListProps {
  activities: AIToolActivity[]
  /**
   * Visual mode forwarded to the shared `ToolActivityRenderer`.
   * Defaults to `'steps'` — set to `'expandable'` when the assistant has
   * declared a plan and the tool calls should appear as a collapsed audit
   * trail beneath the plan-progress card.
   */
  mode?: ToolActivityRendererMode
}
