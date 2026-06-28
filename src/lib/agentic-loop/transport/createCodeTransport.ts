import type {
  ChatMessage,
  CompletionResult,
  RawToolCall,
} from '../agenticLoop.types'

import type { CompletionTransport } from './transport.types'

interface DoneEventPayload {
  streamId: string
  content?: string
  toolCalls?: RawToolCall[]
  finishReason?: string
}

interface ErrorEventPayload {
  streamId: string
  error?: string
}

interface ChunkEventPayload {
  streamId: string
  token: string
}

export interface CreateCodeTransportOptions {
  /**
   * Optional getter for the model id. Called once per `send` so callers can
   * thread mutable model selection (e.g. a Zustand store) without rebuilding
   * the transport on every change.
   */
  modelGetter?: () => string | undefined
}

/**
 * Transport that talks to the Code AI completion endpoint
 * (`cmd_code_ai_completion`). Mirrors `createDailyPlanTransport` but adds
 * an optional `modelGetter` so the Code panel can pick a model per call.
 */
export function createCodeTransport(
  options: CreateCodeTransportOptions = {},
): CompletionTransport {
  const { modelGetter } = options

  return {
    send({ messages, tools, callbacks }) {
      return new Promise<CompletionResult>((resolve, reject) => {
        const streamId = crypto.randomUUID()

        const unlistenChunk = window.api.onCodeAIChunk((data: ChunkEventPayload) => {
          if (data.streamId !== streamId) return
          callbacks.onChunk(data.token)
        })

        const unlistenReasoning = window.api.onCodeAIReasoningChunk(
          (data: ChunkEventPayload) => {
            if (data.streamId !== streamId) return
            callbacks.onReasoningChunk?.(data.token)
          },
        )

        const unlistenDone = window.api.onCodeAIDone((data: DoneEventPayload) => {
          if (data.streamId !== streamId) return
          cleanup()
          resolve({
            content: data.content ?? '',
            toolCalls: data.toolCalls ?? [],
            finishReason: data.finishReason ?? 'stop',
          })
        })

        const unlistenError = window.api.onCodeAIError((data: ErrorEventPayload) => {
          if (data.streamId !== streamId) return
          cleanup()
          reject(new Error(data.error ?? 'Unknown error'))
        })

        function cleanup() {
          unlistenChunk()
          unlistenReasoning()
          unlistenDone()
          unlistenError()
        }

        const sendArgs: Record<string, unknown> = {
          streamId,
          messages: messages as ChatMessage[],
          // `cmd_code_ai_completion` declares `tools` as a required Vec<Value>
          // on the Rust side, so always serialize the key. Empty array is
          // treated as "no tools" by the body builder.
          tools: tools ?? [],
        }
        const model = modelGetter?.()
        if (model !== undefined) sendArgs.model = model

        window.api
          .sendCodeAICompletion(sendArgs as never)
          .catch((err: unknown) => {
            cleanup()
            reject(err instanceof Error ? err : new Error(String(err)))
          })
      })
    },
  }
}
