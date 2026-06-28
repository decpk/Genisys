import { listen } from '@tauri-apps/api/event'
import { create } from 'zustand'

// ── Types ────────────────────────────────────────────────────────────

export type RequestStatus = 'pending' | 'success' | 'error'

export interface ApiRequestEntry {
  id: string
  channel: string
  args: unknown[]
  status: RequestStatus
  startedAt: number
  completedAt: number | null
  duration: number | null
  response: unknown
  error: string | null
}

interface DebugState {
  requests: ApiRequestEntry[]
  isIntercepting: boolean
}

interface DebugActions {
  addRequest: (entry: ApiRequestEntry) => void
  updateRequest: (id: string, patch: Partial<ApiRequestEntry>) => void
  clearRequests: () => void
  toggleIntercepting: () => void
}

// ── Constants ────────────────────────────────────────────────────────

const MAX_REQUESTS = 100
const INTERCEPT_KEY = 'debug-intercepting'

function readPersistedIntercept(): boolean {
  try {
    return localStorage.getItem(INTERCEPT_KEY) === 'true'
  } catch {
    return false
  }
}

// ── Store ────────────────────────────────────────────────────────────

const seenIds = new Set<string>()
let pendingAdds: ApiRequestEntry[] = []
let addFlushScheduled = false

function flushPendingAdds(): void {
  if (pendingAdds.length === 0) return
  const batch = pendingAdds
  pendingAdds = []
  addFlushScheduled = false
  // Defer store update to idle time so it never blocks rendering
  const apply = () =>
    useDebugStore.setState((state) => ({
      requests: [...batch, ...state.requests].slice(0, MAX_REQUESTS),
    }))
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(apply)
  } else {
    setTimeout(apply, 0)
  }
}

export const useDebugStore = create<DebugState & DebugActions>()((set) => ({
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
    // Defer update to idle time
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
    seenIds.clear()
    set({ requests: [] })
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

// ── Debug Listener (receives events via contextBridge callback) ──────

let listenerInstalled = false

function handleDebugData(raw: unknown): void {
  const store = useDebugStore.getState
  const data = raw as Record<string, unknown>
  if (!data || typeof data !== 'object') return
  if (!store().isIntercepting) return

  if (data.type === 'start') {
    // Deduplicate: synchronous Set survives async batching (cross-window + local can overlap)
    const requestId = data.id as string
    if (seenIds.has(requestId)) return
    seenIds.add(requestId)
    const args = Array.isArray(data.args) ? data.args : []
    store().addRequest({
      id: data.id as string,
      channel: data.ch as string,
      args,
      status: 'pending',
      startedAt: data.t as number,
      completedAt: null,
      duration: null,
      response: null,
      error: null
    })
  }

  if (data.type === 'end') {
    const completedAt = data.t as number
    const entry = store().requests.find((r) => r.id === data.id)
    const startedAt = entry?.startedAt ?? completedAt

    if (data.ok) {
      store().updateRequest(data.id as string, {
        status: 'success',
        completedAt,
        duration: completedAt - startedAt,
        response: data.res
      })
    } else {
      store().updateRequest(data.id as string, {
        status: 'error',
        completedAt,
        duration: completedAt - startedAt,
        error: (data.err as string) ?? 'Unknown error'
      })
    }
  }
}

let debugEventUnlisten: (() => void) | null = null

export function initDebugListener(): void {
  if (!import.meta.env.DEV) return
  if (listenerInstalled) return
  listenerInstalled = true

  // Local in-window events (from trackedInvoke in the same window)
  if ((window as any).api?.onDebugEvent) {
    (window as any).api.onDebugEvent(handleDebugData)
  }

  // Cross-window events via Tauri event bus
  void listen('debug-event', (event) => {
    handleDebugData(event.payload)
  }).then((u) => {
    debugEventUnlisten = u
  })
}

// HMR teardown: clean up the cross-window listener on dev reload.
// No-op in production builds.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    debugEventUnlisten?.()
    debugEventUnlisten = null
    listenerInstalled = false
  })
}
