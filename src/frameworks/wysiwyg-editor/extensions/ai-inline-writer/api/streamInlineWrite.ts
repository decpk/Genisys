import { buildInlineWriterPrompt } from '@/prompts/inlineWriterPrompt'

export interface StreamInlineWriteParams {
  instruction: string
  contextBefore: string
  contextAfter: string
  model: string
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export function streamInlineWrite(params: StreamInlineWriteParams): () => void {
  const { instruction, contextBefore, contextAfter, model, onToken, onDone, onError } = params

  const streamId = crypto.randomUUID()
  const conversationId = crypto.randomUUID()

  const { systemPrompt, userPrompt } = buildInlineWriterPrompt(
    instruction,
    contextBefore,
    contextAfter,
  )

  let unlistenChunk: (() => void) | null = null
  let unlistenDone: (() => void) | null = null
  let unlistenError: (() => void) | null = null

  const cleanup = (): void => {
    unlistenChunk?.()
    unlistenDone?.()
    unlistenError?.()
    unlistenChunk = null
    unlistenDone = null
    unlistenError = null
  }

  // Set up listeners before sending
  unlistenChunk = window.api.onChatStreamChunk(
    (data: { streamId: string; token: string }) => {
      if (data.streamId !== streamId) return
      onToken(data.token)
    },
  )

  unlistenDone = window.api.onChatStreamDone(
    (data: { streamId: string }) => {
      if (data.streamId !== streamId) return
      cleanup()
      onDone()
    },
  )

  unlistenError = window.api.onChatStreamError(
    (data: { streamId: string; error: string }) => {
      if (data.streamId !== streamId) return
      cleanup()
      onError(data.error ?? 'An error occurred')
    },
  )

  // Persist the user message then send
  const now = new Date().toISOString()
  window.api
    .appendChatMessage(conversationId, 'Inline AI Write', now, now, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: now,
    })
    .then(() =>
      window.api.sendChatMessage({
        streamId,
        conversationId,
        systemPrompt,
        model,
        enableTools: false,
      }),
    )
    .catch((err: unknown) => {
      cleanup()
      onError(err instanceof Error ? err.message : 'Failed to start AI write')
    })

  return cleanup
}
