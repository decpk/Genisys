import { create } from 'zustand'

import { applyWebpointResponse } from '@/components/Webpoint/ai/applyWebpointResponse'
import { buildWebpointPrompt } from '@/components/Webpoint/ai/buildWebpointPrompt'
import { parseWebpointResponse } from '@/components/Webpoint/ai/parseWebpointResponse'
import type { WebpointAIMessage } from '@/components/Webpoint/ai/types'
import { resolveAppModel } from '@/lib/resolveAppModel'
import { useWebpointStore } from '@/store/webpoint-store'

interface WebpointAIState {
  messagesByPresentation: Record<string, WebpointAIMessage[]>
  isStreaming: boolean
  activeStreamId: string | null
  activity: string | null
  panelOpen: boolean
  inspectorOpen: boolean
  isPresenting: boolean
  presentIndex: number
}

interface WebpointAIActions {
  sendMessage: (prompt: string) => Promise<void>
  stop: () => void
  clear: (presentationId: string) => void
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  toggleInspector: () => void
  setInspectorOpen: (open: boolean) => void
  startPresenting: () => void
  exitPresenting: () => void
  presentNext: () => void
  presentPrev: () => void
}

function wideViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= 1280
}

export const useWebpointAIStore = create<WebpointAIState & WebpointAIActions>()((set, get) => {
  const append = (presentationId: string, messages: WebpointAIMessage[]): void => {
    set((s) => ({
      messagesByPresentation: {
        ...s.messagesByPresentation,
        [presentationId]: [...(s.messagesByPresentation[presentationId] ?? []), ...messages],
      },
    }))
  }

  const patch = (
    presentationId: string,
    messageId: string,
    update: Partial<WebpointAIMessage>
  ): void => {
    set((s) => ({
      messagesByPresentation: {
        ...s.messagesByPresentation,
        [presentationId]: (s.messagesByPresentation[presentationId] ?? []).map((m) =>
          m.id === messageId ? { ...m, ...update } : m
        ),
      },
    }))
  }

  return {
    messagesByPresentation: {},
    isStreaming: false,
    activeStreamId: null,
    activity: null,
    panelOpen: wideViewport(),
    inspectorOpen: wideViewport(),
    isPresenting: false,
    presentIndex: 0,

    sendMessage: async (prompt) => {
      if (get().isStreaming) return
      const wp = useWebpointStore.getState()
      const pres = wp.activePresentation
      if (!pres) return
      const presentationId = pres.presentation.id

      const assistantId = crypto.randomUUID()
      append(presentationId, [
        { id: crypto.randomUUID(), role: 'user', content: prompt },
        { id: assistantId, role: 'assistant', content: '', status: 'streaming' },
      ])

      const activeSlide = pres.slides.find((s) => s.id === wp.activeSlideId) ?? null
      const promptText = buildWebpointPrompt(pres, activeSlide, prompt, false)
      const streamId = crypto.randomUUID()
      const model = resolveAppModel('webpoint')
      set({ isStreaming: true, activeStreamId: streamId, activity: null })

      let buffer = ''
      try {
        await new Promise<void>((resolve, reject) => {
          const offChunk = window.api.onLlmStreamChunk((data) => {
            if (data?.streamId !== streamId) return
            buffer += data.token ?? data.chunk ?? data.content ?? ''
          })
          const offDone = window.api.onLlmStreamDone((data) => {
            if (data?.streamId !== streamId) return
            cleanup()
            resolve()
          })
          const offError = window.api.onLlmStreamError((data) => {
            if (data?.streamId !== streamId) return
            cleanup()
            reject(new Error(data?.error ?? 'AI request failed.'))
          })
          function cleanup(): void {
            offChunk()
            offDone()
            offError()
          }
          window.api
            .sendLlmStreamCompletion({ streamId, systemPrompt: '', userPrompt: promptText, model })
            .catch((e) => {
              cleanup()
              reject(e instanceof Error ? e : new Error('AI request failed.'))
            })
        })
        const parsed = parseWebpointResponse(buffer)
        if (parsed) {
          const applied = await applyWebpointResponse(presentationId, parsed)
          patch(presentationId, assistantId, {
            content: parsed.message ?? `Updated ${applied} slide${applied === 1 ? '' : 's'}.`,
            status: 'done',
            appliedCount: applied,
          })
        } else {
          patch(presentationId, assistantId, {
            content: buffer.trim() || 'No changes returned.',
            status: 'done',
          })
        }
      } catch (err) {
        patch(presentationId, assistantId, {
          content: err instanceof Error ? err.message : 'AI request failed.',
          status: 'error',
        })
      } finally {
        set({ isStreaming: false, activeStreamId: null, activity: null })
      }
    },

    stop: () => {
      set({ isStreaming: false, activeStreamId: null, activity: null })
    },

    clear: (presentationId) => {
      set((s) => ({
        messagesByPresentation: { ...s.messagesByPresentation, [presentationId]: [] },
      }))
    },

    togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
    setPanelOpen: (open) => set({ panelOpen: open }),

    toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
    setInspectorOpen: (open) => set({ inspectorOpen: open }),

    startPresenting: () => {
      const wp = useWebpointStore.getState()
      const slides = wp.activePresentation?.slides ?? []
      const found = slides.findIndex((sl) => sl.id === wp.activeSlideId)
      set({ isPresenting: true, presentIndex: found < 0 ? 0 : found })
    },
    exitPresenting: () => set({ isPresenting: false }),
    presentNext: () => {
      const slides = useWebpointStore.getState().activePresentation?.slides ?? []
      set((s) => ({ presentIndex: Math.min(s.presentIndex + 1, Math.max(0, slides.length - 1)) }))
    },
    presentPrev: () => set((s) => ({ presentIndex: Math.max(0, s.presentIndex - 1) })),
  }
})
