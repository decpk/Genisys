import type { AIConfirmAction } from '@/right-panels/AIAssistantPanel'
import { resolveToolConfirmation } from '@/lib/ai-assistant-auto-approve'

import type { AgenticLoopCallbacks } from '../agenticLoop.types'

export interface HandleConfirmRequiredParams {
  confirmAction: AIConfirmAction
  executeAfterConfirm: () => Promise<string>
  callbacks: AgenticLoopCallbacks
}

export interface HandleConfirmRequiredOutcome {
  message: string
  status: 'confirmed' | 'cancelled' | 'error'
}

/**
 * Wrap `resolveToolConfirmation` so the agentic loop only deals with the
 * minimal `{ message, status }` shape it cares about.
 */
export async function handleConfirmRequired(
  params: HandleConfirmRequiredParams,
): Promise<HandleConfirmRequiredOutcome> {
  const { confirmAction, executeAfterConfirm, callbacks } = params

  const outcome = await resolveToolConfirmation({
    confirmAction,
    executeAfterConfirm,
    onConfirmRequired: callbacks.onConfirmRequired,
    isAutoApprove: callbacks.isAutoApprove,
  })

  return { message: outcome.message, status: outcome.status }
}
