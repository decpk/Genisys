import type {
  AgenticLoopCallbacks,
  ChatMessage,
  CompletionResult,
} from '../agenticLoop.types'
import type { CompletionTransport } from '../transport/transport.types'

import { buildFallbackSystemMessage } from './buildFallbackSystemMessage'

export interface ForceFinalAnswerParams {
  transport: CompletionTransport
  messages: ChatMessage[]
  callbacks: AgenticLoopCallbacks
}

/**
 * Send one extra completion request with `tools` omitted and a system
 * nudge prepended. Whatever assistant text comes back becomes the loop's
 * final answer (we deliberately ignore any `toolCalls` the model emits at
 * this point).
 */
export async function forceFinalAnswer(
  params: ForceFinalAnswerParams,
): Promise<CompletionResult> {
  const { transport, messages, callbacks } = params

  const fallbackMessages: ChatMessage[] = [buildFallbackSystemMessage(), ...messages]

  return transport.send({
    messages: fallbackMessages,
    tools: undefined,
    callbacks,
  })
}
