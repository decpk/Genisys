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

export interface CreateDailyPlanTransportOptions {
  /**
   * Optional getter for the model id. Called once per `send` so callers
   * can thread mutable model selection (e.g. a Zustand store) without
   * rebuilding the transport on every change.
   */
  modelGetter?: () => string | undefined
}

/**
 * Transport that talks to the DailyPlan AI completion endpoint
 * (`cmd_dailyplan_ai_completion`). Each `send` call mints a fresh
 * `streamId`, registers the four event listeners scoped to that id,
 * forwards streamed chunks to the supplied callbacks, and resolves with
 * the `done` payload (or rejects with the `error` payload).
 */
export function createDailyPlanTransport(
  options: CreateDailyPlanTransportOptions = {},
): CompletionTransport {
  const { modelGetter } = options

  return {
    send({ messages, tools, callbacks }) {
      return new Promise<CompletionResult>((resolve, reject) => {
        const streamId = crypto.randomUUID()

        const unlistenChunk = window.api.onDailyPlanAIChunk((data: ChunkEventPayload) => {
          if (data.streamId !== streamId) return
          callbacks.onChunk(data.token)
        })

        const unlistenReasoning = window.api.onDailyPlanAIReasoningChunk(
          (data: ChunkEventPayload) => {
            if (data.streamId !== streamId) return
            callbacks.onReasoningChunk?.(data.token)
          },
        )

        const unlistenDone = window.api.onDailyPlanAIDone((data: DoneEventPayload) => {
          if (data.streamId !== streamId) return
          cleanup()
          resolve({
            content: data.content ?? '',
            toolCalls: data.toolCalls ?? [],
            finishReason: data.finishReason ?? 'stop',
          })
        })

        const unlistenError = window.api.onDailyPlanAIError((data: ErrorEventPayload) => {
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
        }
        if (tools !== undefined) sendArgs.tools = tools
        const model = modelGetter?.()
        if (model) sendArgs.model = model

        window.api
          .sendDailyPlanAICompletion(sendArgs as never)
          .catch((err: unknown) => {
            cleanup()
            reject(err instanceof Error ? err : new Error(String(err)))
          })
      })
    },
  }
}
