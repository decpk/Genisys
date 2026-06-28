import type { AIConfirmAction } from '@/right-panels/AIAssistantPanel'

export interface ResolveToolConfirmationParams {
  /** Confirmation payload emitted by the tool. */
  confirmAction: AIConfirmAction
  /** Tool-provided callback that performs the destructive action. */
  executeAfterConfirm: () => Promise<string>
  /** Runner callback that surfaces the confirmation panel to the user. */
  onConfirmRequired: (confirmAction: AIConfirmAction) => Promise<boolean>
  /**
   * Optional predicate that lets the host (hook) opt into auto-approval
   * (e.g. when the AI Assistant is running in `'agent'` mode).
   */
  isAutoApprove?: () => boolean
}

export type ResolveToolConfirmationStatus = 'confirmed' | 'cancelled' | 'error'

export interface ResolveToolConfirmationOutcome {
  /** Final disposition of the confirmation flow. */
  status: ResolveToolConfirmationStatus
  /** Tool-result message to feed back into the LLM conversation. */
  message: string
}
