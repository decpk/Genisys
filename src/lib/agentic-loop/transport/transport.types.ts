import type {
  AgenticLoopCallbacks,
  ChatMessage,
  CompletionResult,
} from '../agenticLoop.types'

/**
 * A `CompletionTransport` owns one wire call to the streaming chat-completion
 * backend. It listens for chunk / reasoning / done / error events scoped to
 * the call's stream id and resolves with a `CompletionResult` once the model
 * is done.
 *
 * Transports are expected to be self-contained — i.e. they hold any
 * panel-specific state (model selection, channel ids, etc.) and surface a
 * single `send` entry point so the loop stays agnostic.
 */
export interface CompletionTransport {
  /**
   * Send one completion request and wait for it to finish. Streamed chunks
   * are forwarded to the supplied callbacks while the request is in flight.
   *
   * `tools` may be omitted to ask the model for a tools-less final answer
   * (used by `forceFinalAnswer`).
   */
  send(args: {
    messages: ChatMessage[]
    tools?: unknown[]
    callbacks: AgenticLoopCallbacks
  }): Promise<CompletionResult>
}
