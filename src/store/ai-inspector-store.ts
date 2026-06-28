import { listen } from '@tauri-apps/api/event'
import { create } from 'zustand'

// ── Types ────────────────────────────────────────────────────────────

export type AIRequestStatus = 'pending' | 'streaming' | 'success' | 'error'

export interface AIRequestEntry {
  id: string
  channel: string
  originApp: string
  model: string
  systemPrompt: string
  userMessage: string
  requestPayload: unknown
  responsePayload: unknown
  status: AIRequestStatus
  startedAt: number
  completedAt: number | null
  duration: number | null
  error: string | null
  streamChunks: number
}

interface AIInspectorState {
  requests: AIRequestEntry[]
  isIntercepting: boolean
}

interface AIInspectorActions {
  addRequest: (entry: AIRequestEntry) => void
  updateRequest: (id: string, patch: Partial<AIRequestEntry>) => void
  clearRequests: () => void
  toggleIntercepting: () => void
}

// ── Constants ────────────────────────────────────────────────────────

const MAX_REQUESTS = 200
const INTERCEPT_KEY = 'ai-inspector-intercepting'

/** Channels that represent AI API calls */
const AI_CHANNELS = new Set([
  'cmd_chat_send_message',
  'cmd_research_send_query',
  'cmd_crawl_webpage',
  'cmd_crawl_webpage_lite',
  'cmd_execute_single_tool',
  'cmd_llm_json_completion',
  'cmd_explorer_ai_command',
])

function readPersistedIntercept(): boolean {
  try {
    return localStorage.getItem(INTERCEPT_KEY) === 'true'
  } catch {
    return false
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function extractModel(args: unknown[]): string {
  if (!args || args.length === 0) return ''
  const first = args[0]
  if (first && typeof first === 'object') {
    const obj = first as Record<string, unknown>
    if (typeof obj.model === 'string') return obj.model
  }
  return ''
}

function extractSystemPrompt(args: unknown[]): string {
  if (!args || args.length === 0) return ''
  const first = args[0]
  if (first && typeof first === 'object') {
    const obj = first as Record<string, unknown>
    if (typeof obj.systemPrompt === 'string') return obj.systemPrompt.slice(0, 500)
    if (typeof obj.system_prompt === 'string') return obj.system_prompt.slice(0, 500)
  }
  return ''
}

function extractUserMessage(args: unknown[]): string {
  if (!args || args.length === 0) return ''
  const first = args[0]
  if (first && typeof first === 'object') {
    const obj = first as Record<string, unknown>
    if (typeof obj.query === 'string') return obj.query.slice(0, 500)
    if (typeof obj.message === 'string') return obj.message.slice(0, 500)
    if (typeof obj.content === 'string') return obj.content.slice(0, 500)
    if (typeof obj.prompt === 'string') return obj.prompt.slice(0, 500)
    // For chat messages, look for the last user message in messages array
    if (Array.isArray(obj.messages)) {
      const msgs = obj.messages as Array<{ role?: string; content?: string }>
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'user' && typeof msgs[i].content === 'string') {
          return msgs[i].content!.slice(0, 500)
        }
      }
    }
  }
  return ''
}

function guessOriginApp(channel: string): string {
  if (channel.includes('chat')) return 'Chat'
  if (channel.includes('research')) return 'Chat'
  if (channel.includes('crawl')) return 'Chat'
  if (channel.includes('explorer_ai')) return 'Explorer'
  if (channel.includes('llm_json')) return 'System'
  if (channel.includes('execute_single_tool')) return 'Chat'
  return 'Unknown'
}

// ── Store ────────────────────────────────────────────────────────────

/** Tracks all request IDs we've already processed to prevent duplicates
 *  across the async batching lifecycle (pendingAdds → microtask → idle). */
const seenRequestIds = new Set<string>()

let pendingAdds: AIRequestEntry[] = []
let addFlushScheduled = false

function flushPendingAdds(): void {
  if (pendingAdds.length === 0) return
  const batch = pendingAdds
  pendingAdds = []
  addFlushScheduled = false
  const apply = () =>
    useAIInspectorStore.setState((state) => {
      const next = [...batch, ...state.requests]
      if (next.length <= MAX_REQUESTS) return { requests: next }
      const kept = next.slice(0, MAX_REQUESTS)
      const dropped = next.slice(MAX_REQUESTS)
      // Evict module-level correlation entries for requests that just fell
      // off the cap so the 4 Maps/Sets stay bounded alongside `requests`.
      for (const req of dropped) evictRequestArtifacts(req.id)
      return { requests: kept }
    })
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(apply)
  } else {
    setTimeout(apply, 0)
  }
}

/**
 * Removes any module-level correlation entries associated with `requestId`.
 * Called when a request is evicted by the MAX_REQUESTS cap or via
 * `clearRequests`, so the 4 Maps/Sets stay bounded.
 */
function evictRequestArtifacts(requestId: string): void {
  seenRequestIds.delete(requestId)
  streamingRequestIds.delete(requestId)
  streamedContent.delete(requestId)
  // `streamToRequestId` is keyed by streamId; reverse-lookup by value.
  for (const [streamId, reqId] of streamToRequestId) {
    if (reqId === requestId) streamToRequestId.delete(streamId)
  }
}

export const useAIInspectorStore = create<AIInspectorState & AIInspectorActions>()((set, get) => ({
  requests: [],
  isIntercepting: readPersistedIntercept(),

  addRequest: (entry) => {
    pendingAdds.push(entry)
    if (!addFlushScheduled) {
      addFlushScheduled = true
      queueMicrotask(flushPendingAdds)
    }
  },

  updateRequest: (id, patch) => {
    const apply = () =>
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? { ...r, ...patch } : r))
      }))
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(apply)
    } else {
      setTimeout(apply, 0)
    }
  },

  clearRequests: () => {
    set({ requests: [] })
    seenRequestIds.clear()
    streamingRequestIds.clear()
    streamedContent.clear()
    streamToRequestId.clear()
  },

  toggleIntercepting: () => {
    set((state) => {
      const next = !state.isIntercepting
      try {
        localStorage.setItem(INTERCEPT_KEY, String(next))
      } catch {}
      return { isIntercepting: next }
    })
  }
}))

// ── Streaming event → request correlation ────────────────────────────

/** Maps streamId → request id for correlating streaming events */
const streamToRequestId = new Map<string, string>()

/** Request IDs that have an active stream — invoke-end should not finalize these */
const streamingRequestIds = new Set<string>()

/** Accumulates streamed content per request */
const streamedContent = new Map<string, string>()

function handleStreamEvent(data: Record<string, unknown>, type: 'chunk' | 'done' | 'error'): void {
  const store = useAIInspectorStore.getState
  if (!store().isIntercepting) return

  const streamId = (data.streamId ?? data.stream_id ?? data.sessionId ?? data.session_id) as string | undefined
  if (!streamId) return

  const requestId = streamToRequestId.get(streamId)
  if (!requestId) return

  if (type === 'chunk') {
    const entry = store().requests.find((r) => r.id === requestId)
    if (entry) {
      // Accumulate streamed content — payload shape is { streamId, token }
      const chunk = (data.token ?? data.content ?? data.delta ?? data.text ?? '') as string
      if (chunk) {
        const prev = streamedContent.get(requestId) ?? ''
        streamedContent.set(requestId, prev + chunk)
      }
      store().updateRequest(requestId, {
        status: 'streaming',
        streamChunks: entry.streamChunks + 1,
      })
    }
  } else if (type === 'done') {
    const completedAt = Date.now()
    const entry = store().requests.find((r) => r.id === requestId)
    const startedAt = entry?.startedAt ?? completedAt
    const accumulated = streamedContent.get(requestId)
    store().updateRequest(requestId, {
      status: 'success',
      completedAt,
      duration: completedAt - startedAt,
      responsePayload: accumulated
        ? { streamedContent: accumulated, ...data as object }
        : data,
    })
    streamToRequestId.delete(streamId)
    streamingRequestIds.delete(requestId)
    streamedContent.delete(requestId)
  } else if (type === 'error') {
    const completedAt = Date.now()
    const entry = store().requests.find((r) => r.id === requestId)
    const startedAt = entry?.startedAt ?? completedAt
    store().updateRequest(requestId, {
      status: 'error',
      completedAt,
      duration: completedAt - startedAt,
      error: (data.error as string) ?? (data.message as string) ?? 'Stream error',
      responsePayload: data,
    })
    streamToRequestId.delete(streamId)
    streamingRequestIds.delete(requestId)
    streamedContent.delete(requestId)
  }
}

// ── Debug Event Handler ──────────────────────────────────────────────

function handleDebugData(raw: unknown): void {
  const store = useAIInspectorStore.getState
  const data = raw as Record<string, unknown>
  if (!data || typeof data !== 'object') return
  if (!store().isIntercepting) return

  if (data.type === 'start') {
    const channel = data.ch as string
    if (!AI_CHANNELS.has(channel)) return

    // Deduplicate using persistent Set (survives async batching lifecycle)
    const requestId = data.id as string
    if (seenRequestIds.has(requestId)) return
    seenRequestIds.add(requestId)

    const args = Array.isArray(data.args) ? data.args : []

    // Correlate streamId for streaming events
    if (args.length > 0 && args[0] && typeof args[0] === 'object') {
      const obj = args[0] as Record<string, unknown>
      const streamId = (obj.streamId ?? obj.stream_id ?? obj.sessionId ?? obj.session_id) as string | undefined
      if (streamId) {
        streamToRequestId.set(streamId, requestId)
        streamingRequestIds.add(requestId)
      }
    }

    store().addRequest({
      id: requestId,
      channel,
      originApp: guessOriginApp(channel),
      model: extractModel(args),
      systemPrompt: extractSystemPrompt(args),
      userMessage: extractUserMessage(args),
      requestPayload: args,
      responsePayload: null,
      status: 'pending',
      startedAt: data.t as number,
      completedAt: null,
      duration: null,
      error: null,
      streamChunks: 0,
    })
  }

  if (data.type === 'end') {
    const id = data.id as string
    // If this request has an active stream, don't finalize from invoke-end
    // — let the streaming done/error events handle it with the full response
    if (streamingRequestIds.has(id)) return

    const entry = store().requests.find((r) => r.id === id)
    if (!entry) return
    // Only update if not already completed by streaming events
    if (entry.status === 'success' || entry.status === 'error') return

    const completedAt = data.t as number
    const startedAt = entry.startedAt ?? completedAt

    if (data.ok) {
      store().updateRequest(id, {
        status: 'success',
        completedAt,
        duration: completedAt - startedAt,
        responsePayload: data.res,
      })
    } else {
      store().updateRequest(id, {
        status: 'error',
        completedAt,
        duration: completedAt - startedAt,
        error: (data.err as string) ?? 'Unknown error',
        responsePayload: data.err,
      })
    }
  }
}

// ── Init ─────────────────────────────────────────────────────────────

let listenerInstalled = false
let debugEventUnlisten: (() => void) | null = null
const streamingUnlistens: Array<() => void> = []

export function initAIInspectorListener(): void {
  if (!import.meta.env.DEV) return
  if (listenerInstalled) return
  listenerInstalled = true

  // Subscribe to debug events from tauri-api-bridge
  window.api?.onDebugEvent(handleDebugData)

  // Also listen for cross-window debug events
  void listen('debug-event', (event) => {
    handleDebugData(event.payload)
  }).then((u) => {
    debugEventUnlisten = u
  })

  // Subscribe to streaming events for richer data
  const streamingEvents = [
    { event: 'chat-stream-chunk', type: 'chunk' as const },
    { event: 'chat-stream-done', type: 'done' as const },
    { event: 'chat-stream-error', type: 'error' as const },
    { event: 'research-stream-chunk', type: 'chunk' as const },
    { event: 'research-stream-done', type: 'done' as const },
    { event: 'research-stream-error', type: 'error' as const },
    { event: 'explorer-ai-chunk', type: 'chunk' as const },
    { event: 'explorer-ai-done', type: 'done' as const },
    { event: 'explorer-ai-error', type: 'error' as const },
  ]

  for (const { event, type } of streamingEvents) {
    void listen(event, (ev) => {
      handleStreamEvent(ev.payload as Record<string, unknown>, type)
    }).then((u) => {
      streamingUnlistens.push(u)
    })
  }
}

// HMR teardown: clean up Tauri listeners on dev reload so handlers don't
// duplicate. No-op in production (import.meta.hot is undefined).
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    debugEventUnlisten?.()
    debugEventUnlisten = null
    for (const u of streamingUnlistens) u()
    streamingUnlistens.length = 0
    listenerInstalled = false
  })
}
