import { useRef, useState, useCallback } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { buildExplainPrompt } from '@/prompts/explainSelectionPrompt'

interface ExplainStreamResult {
  content: string
  isStreaming: boolean
  error: string | null
  explain: (text: string) => void
  cancel: () => void
  flush: () => void
}

interface UseExplainStreamOptions {
  shouldDeferRender?: () => boolean
}

export function useExplainStream(options: UseExplainStreamOptions = {}): ExplainStreamResult {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contentRef = useRef('')
  const pendingRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const streamIdRef = useRef<string | null>(null)
  const cleanupsRef = useRef<Array<() => void>>([])
  const optionsRef = useRef(options)

  optionsRef.current = options

  const flush = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    pendingRef.current = false
    setContent(contentRef.current)
  }, [])

  const scheduleFlush = useCallback(() => {
    if (pendingRef.current) return

    pendingRef.current = true
    const run = () => {
      if (optionsRef.current.shouldDeferRender?.()) {
        rafRef.current = requestAnimationFrame(run)
        return
      }

      rafRef.current = null
      pendingRef.current = false
      setContent(contentRef.current)
    }
    rafRef.current = requestAnimationFrame(run)
  }, [])

  const cleanup = useCallback(() => {
    for (const fn of cleanupsRef.current) fn()
    cleanupsRef.current = []
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    pendingRef.current = false
    streamIdRef.current = null
  }, [])

  const cancel = useCallback(() => {
    cleanup()
    setIsStreaming(false)
  }, [cleanup])

  const explain = useCallback(
    (text: string) => {
      // Reset
      cleanup()
      contentRef.current = ''
      setContent('')
      setError(null)
      setIsStreaming(true)

      const streamId = crypto.randomUUID()
      const conversationId = crypto.randomUUID()
      streamIdRef.current = streamId

      const language = useSettingsStore.getState().explainLanguage
      const model = useSettingsStore.getState().chatModel

      const cleanupChunk = window.api.onResearchStreamChunk(
        (data: { streamId: string; token: string }) => {
          if (data.streamId !== streamId) return;
          contentRef.current += data.token;
          scheduleFlush()
        },
      );

      const cleanupDone = window.api.onResearchStreamDone(
        (data: { streamId: string }) => {
          if (data.streamId !== streamId) return;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          pendingRef.current = false;
          setContent(contentRef.current);
          setIsStreaming(false);
          cleanup();
        },
      );

      const cleanupError = window.api.onResearchStreamError(
        (data: { streamId: string; error: string }) => {
          if (data.streamId !== streamId) return;
          setError(data.error);
          setIsStreaming(false);
          cleanup();
        },
      );

      cleanupsRef.current = [cleanupChunk, cleanupDone, cleanupError]

      window.api.sendResearchQuery({
        streamId,
        sessionId: conversationId,
        query: buildExplainPrompt(text, language),
        sources: [],
        model,
      });
    },
    [cleanup, scheduleFlush],
  )

  return { content, isStreaming, error, explain, cancel, flush }
}
