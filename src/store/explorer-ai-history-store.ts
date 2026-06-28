import { create } from 'zustand'

import type {
  ExplorerAIMessage,
  ExplorerAIStatus,
  ExplorerConfirmAction,
  ExplorerShellConfirm,
  ToolActivity,
} from "@/components/ProjectExplorer/components/ExplorerAICommand/ExplorerAICommand.types";

// ─── Types ───────────────────────────────────────────────────────

export interface ExplorerAISession {
  id: string;
  title: string;
  rootPath: string;
  messages: ExplorerAIMessage[];
  /** Live streaming state — persisted per-session so background streams keep running */
  status: ExplorerAIStatus;
  streamingContent: string;
  toolActivities: ToolActivity[];
  pendingConfirm: ExplorerConfirmAction | null;
  /** A shell command awaiting user approval (hard gate before execution). */
  pendingShellConfirm: ExplorerShellConfirm | null;
  error: string | null;
  conversationHistory: { role: string; content: string }[];
  activeStreamId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExplorerAIHistoryState {
  sessions: ExplorerAISession[]
  activeSessionId: string | null
}

interface ExplorerAIHistoryActions {
  createSession: (rootPath: string) => string
  selectSession: (id: string) => void
  addMessage: (sessionId: string, message: ExplorerAIMessage) => void
  removeSession: (id: string) => void
  clearAll: () => void
  getActiveSession: () => ExplorerAISession | null
  getSession: (id: string) => ExplorerAISession | undefined
  // ── Per-session streaming state mutations ──
  updateSession: (sessionId: string, patch: Partial<ExplorerAISession>) => void
  appendStreamingContent: (sessionId: string, token: string) => void
  addToolActivity: (sessionId: string, activity: ToolActivity) => void
  updateToolActivity: (sessionId: string, toolName: string, result: string) => void
  markAllToolsDone: (sessionId: string) => void
  resetSession: (sessionId: string) => void
}

// ─── Store ───────────────────────────────────────────────────────

function createEmptySessionFields(): Pick<
  ExplorerAISession,
  | "status"
  | "streamingContent"
  | "toolActivities"
  | "pendingConfirm"
  | "pendingShellConfirm"
  | "error"
  | "activeStreamId"
> {
  return {
    status: "idle",
    streamingContent: "",
    toolActivities: [],
    pendingConfirm: null,
    pendingShellConfirm: null,
    error: null,
    activeStreamId: null,
  };
}

export const useExplorerAIHistoryStore = create<
  ExplorerAIHistoryState & ExplorerAIHistoryActions
>()((set, get) => ({
  sessions: [],
  activeSessionId: null,

  createSession: (rootPath) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const session: ExplorerAISession = {
      id,
      title: 'New Chat',
      rootPath,
      messages: [],
      conversationHistory: [],
      ...createEmptySessionFields(),
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: id,
    }))
    return id
  },

  selectSession: (id) => {
    if (get().activeSessionId === id) return
    set({ activeSessionId: id })
  },

  addMessage: (sessionId, message) => {
    set((state) => {
      const sessions = state.sessions.map((s) => {
        if (s.id !== sessionId) return s
        const messages = [...s.messages, message]
        const conversationHistory = [
          ...s.conversationHistory,
          { role: message.role, content: message.content },
        ]
        // Auto-title from first user message
        const title =
          s.title === 'New Chat' && message.role === 'user'
            ? message.content.slice(0, 50) + (message.content.length > 50 ? '…' : '')
            : s.title
        return { ...s, messages, conversationHistory, title, updatedAt: new Date().toISOString() }
      })
      return { sessions }
    })
  },

  removeSession: (id) => {
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id)
      const activeSessionId =
        state.activeSessionId === id
          ? sessions[0]?.id ?? null
          : state.activeSessionId
      return { sessions, activeSessionId }
    })
  },

  clearAll: () => {
    set({ sessions: [], activeSessionId: null })
  },

  getActiveSession: () => {
    const { sessions, activeSessionId } = get()
    return sessions.find((s) => s.id === activeSessionId) ?? null
  },

  getSession: (id) => {
    return get().sessions.find((s) => s.id === id)
  },

  // ── Per-session streaming state mutations ──

  updateSession: (sessionId, patch) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
      ),
    }))
  },

  appendStreamingContent: (sessionId, token) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, streamingContent: s.streamingContent + token }
          : s,
      ),
    }))
  },

  addToolActivity: (sessionId, activity) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, toolActivities: [...s.toolActivities, activity] }
          : s,
      ),
    }))
  },

  updateToolActivity: (sessionId, toolName, result) => {
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== sessionId) return s
        let found = false
        const toolActivities = s.toolActivities.map((ta) => {
          if (!found && ta.toolName === toolName && ta.status === 'running') {
            found = true
            return { ...ta, result, status: 'done' as const }
          }
          return ta
        })
        return { ...s, toolActivities }
      }),
    }))
  },

  markAllToolsDone: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              toolActivities: s.toolActivities.map((ta) =>
                ta.status === 'running' ? { ...ta, status: 'done' as const } : ta,
              ),
            }
          : s,
      ),
    }))
  },

  resetSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [],
              conversationHistory: [],
              title: 'New Chat',
              ...createEmptySessionFields(),
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    }))
  },
}))
