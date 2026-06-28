import type { ChatMessage } from '../agenticLoop.types'

/**
 * System-style nudge prepended to the message list when the loop is forced
 * into producing a final answer (iteration budget exhausted, or the host
 * declined to grant more budget). Keeps the model from re-attempting tools.
 */
export function buildFallbackSystemMessage(): ChatMessage {
  return {
    role: 'system',
    content:
      'You have reached the tool-call budget for this turn. Do not call any more tools. ' +
      'Summarise what you have found so far and produce the best final answer you can ' +
      'with the information already gathered.',
  }
}
