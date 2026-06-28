import { create } from 'zustand'

import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import { useSettingsStore } from '@/store/settings-store'
import type { ChatMessage, ChatConversationMeta } from '../../../preload/index.d'
import {
  messagesCache,
  sourcesCache,
  toolCallsCache,
  invalidateConversationCaches,
  clearAllChatCaches,
} from '@/store/chat-cache'

const MESSAGES_PAGE_SIZE = 50

// ─── Source / Citation types ─────────────────────────────────────

export interface ChatSource {
  id: string
  sessionId: string
  sourceType: 'file' | 'repo' | 'raw'
  path: string | null
  name: string
  createdAt: string
}

export interface CitationRef {
  filePath: string
  startLine?: number
  endLine?: number
}

export interface SourcePreview {
  filePath: string
  name: string
  sourceType: 'file' | 'repo' | 'raw'
  content?: string
  startLine?: number
  endLine?: number
}

// ─── Tool Call types ─────────────────────────────────────────────

export interface ToolCallRecord {
  id: string
  messageId: string
  conversationId: string
  toolName: string
  args: string
  result: string | null
  status: string
  startedAt: string
  completedAt: string | null
  sortOrder: number
}

export interface ToolCallSummary {
  messageId: string;
  totalCount: number;
  doneCount: number;
  firstStartedAt: string;
  lastCompletedAt: string | null;
  totalDurationMs: number;
}

// ─── Store types ─────────────────────────────────────────────────

interface ChatHistoryState {
  /** Lightweight metadata for all conversations (no messages) */
  conversations: ChatConversationMeta[];
  activeConversationId: string | null;
  /** Messages for the currently active conversation */
  activeMessages: ChatMessage[];
  /** Whether there are older messages to load for the active conversation */
  hasMoreMessages: boolean;
  /** Whether messages are being loaded (initial or pagination) */
  isLoadingMessages: boolean;
  isLoaded: boolean;
  /** Sources attached to the active conversation */
  activeSources: ChatSource[];
  /** Active citation being viewed in the right panel */
  activeCitation: CitationRef | null;
  /** Source preview modal state */
  sourcePreview: SourcePreview | null;
  /** Persisted tool calls for the active conversation */
  activeToolCalls: ToolCallRecord[];
  /** Whether tool calls are currently being loaded */
  isLoadingToolCalls: boolean;
  /** Whether tool calls have been loaded for the active conversation */
  toolCallsLoaded: boolean;
  /** Per-message summaries (lightweight, loaded on Activity tab open) */
  activitySummaries: ToolCallSummary[];
  /** Whether activity summaries have been loaded */
  summariesLoaded: boolean;
  /** Whether activity summaries are being loaded */
  isLoadingSummaries: boolean;
  /** Tool calls loaded per message (keyed by messageId) */
  expandedToolCalls: Record<string, ToolCallRecord[]>;
  /** Set of messageIds currently loading tool calls */
  loadingMessageIds: string[];
  /** Per-conversation agent mode (in-memory only) */
  agentModeByConversation: Record<string, AgentMode>;
}

interface ChatHistoryActions {
  loadConversations: () => Promise<void>;
  createConversation: () => string;
  selectConversation: (id: string | null) => void;
  loadMoreMessages: () => Promise<void>;
  addMessage: (conversationId: string, message: ChatMessage) => Promise<void>;
  saveConversation: (conversationId: string) => Promise<void>;
  removeConversation: (conversationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  // Sources
  loadSources: (conversationId: string) => Promise<void>;
  addSource: (source: Omit<ChatSource, "id" | "createdAt">) => Promise<void>;
  removeSource: (sourceId: string) => Promise<void>;
  // Citation
  setActiveCitation: (citation: CitationRef | null) => void;
  // Source preview
  openSourcePreview: (preview: SourcePreview) => void;
  closeSourcePreview: () => void;
  // Tool calls
  loadToolCalls: (conversationId: string) => Promise<void>;
  saveToolCalls: (toolCalls: ToolCallRecord[]) => Promise<void>;
  // Two-level lazy loading
  loadActivitySummaries: (conversationId: string) => Promise<void>;
  loadMessageToolCalls: (messageId: string) => Promise<void>;
  getActiveAgentMode: () => AgentMode;
  setActiveAgentMode: (mode: AgentMode) => void;
}

export const useChatHistoryStore = create<ChatHistoryState & ChatHistoryActions>()(
  (set, get) => ({
    conversations: [],
    activeConversationId: null,
    activeMessages: [],
    hasMoreMessages: false,
    isLoadingMessages: false,
    isLoaded: false,
    activeSources: [],
    activeCitation: null,
    sourcePreview: null,
    activeToolCalls: [],
    isLoadingToolCalls: false,
    toolCallsLoaded: false,
    activitySummaries: [],
    summariesLoaded: false,
    isLoadingSummaries: false,
    expandedToolCalls: {},
    loadingMessageIds: [],
    agentModeByConversation: {},

    loadConversations: async () => {
      if (get().isLoaded) return;
      try {
        const conversations = await window.api.loadChatList();
        set({ conversations, isLoaded: true });
      } catch {
        set({ conversations: [], isLoaded: true });
      }
    },

    createConversation: () => {
      const _start = performance.now();
      console.log(
        "[ChatFlow] ChatMain.handleSend() → store.createConversation()",
      );
      const id = crypto.randomUUID();
      const meta: ChatConversationMeta = {
        id,
        title: "New Chat",
        messageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        conversations: [meta, ...state.conversations],
        activeConversationId: id,
        activeMessages: [],
        hasMoreMessages: false,
        activeSources: [],
        activeCitation: null,
      }));
      const _end = performance.now();
      console.log(
        `[ChatFlow] store.createConversation() | start: ${_start.toFixed(2)}ms | end: ${_end.toFixed(2)}ms | diff: ${(_end - _start).toFixed(2)}ms`,
      );
      return id;
    },

    selectConversation: (id) => {
      const state = get();
      if (state.activeConversationId === id) return;

      // ── Save current conversation's state into caches before switching ──
      const prevId = state.activeConversationId;
      if (prevId && state.activeMessages.length > 0) {
        messagesCache.set(prevId, {
          messages: state.activeMessages,
          hasMore: state.hasMoreMessages,
        });
        sourcesCache.set(prevId, state.activeSources);
        if (state.toolCallsLoaded) {
          toolCallsCache.set(prevId, state.activeToolCalls);
        }
      }

      // ── Reset active state ──
      set({
        activeConversationId: id,
        activeMessages: [],
        hasMoreMessages: false,
        activeSources: [],
        activeCitation: null,
        activeToolCalls: [],
        isLoadingToolCalls: false,
        toolCallsLoaded: false,
        activitySummaries: [],
        summariesLoaded: false,
        isLoadingSummaries: false,
        expandedToolCalls: {},
        loadingMessageIds: [],
      });

      if (!id) return;

      // ── Check caches for instant restore ──
      const cachedMessages = messagesCache.peek(id);
      const cachedSources = sourcesCache.peek(id);
      const cachedToolCalls = toolCallsCache.peek(id);

      if (cachedMessages) {
        // Cache hit — restore instantly, no loading spinner
        set({
          activeMessages: cachedMessages.messages,
          hasMoreMessages: cachedMessages.hasMore,
          activeSources: cachedSources ?? [],
          activeToolCalls: cachedToolCalls ?? [],
          toolCallsLoaded: !!cachedToolCalls,
        });
        // Promote entries in LRU order
        messagesCache.get(id).catch(() => {});
        sourcesCache.get(id).catch(() => {});
        toolCallsCache.get(id).catch(() => {});
        return;
      }

      // ── Cache miss — load from DB ──

      // Load sources
      sourcesCache
        .get(id)
        .then((sources) => {
          if (get().activeConversationId !== id) return;
          set({ activeSources: sources });
        })
        .catch(() => {});

      // Load tool calls
      toolCallsCache
        .get(id)
        .then((toolCalls) => {
          if (get().activeConversationId !== id) return;
          set({
            activeToolCalls: toolCalls,
            toolCallsLoaded: true,
          });
        })
        .catch(() => {});

      // Load messages
      const meta = state.conversations.find((c) => c.id === id);
      if (!meta || meta.messageCount === 0) return;

      set({ isLoadingMessages: true });
      messagesCache
        .get(id)
        .then((cached) => {
          if (get().activeConversationId !== id) return;
          set({
            activeMessages: cached.messages,
            hasMoreMessages: cached.hasMore,
            isLoadingMessages: false,
          });
        })
        .catch(() => {
          if (get().activeConversationId !== id) return;
          set({
            activeMessages: [],
            hasMoreMessages: false,
            isLoadingMessages: false,
          });
        });
    },

    loadMoreMessages: async () => {
      const state = get();
      if (
        !state.activeConversationId ||
        !state.hasMoreMessages ||
        state.isLoadingMessages
      )
        return;

      const oldestMessage = state.activeMessages[0];
      if (!oldestMessage || oldestMessage.sortOrder == null) return;

      const beforeSortOrder = oldestMessage.sortOrder;

      set({ isLoadingMessages: true });
      try {
        const page = await window.api.loadConversationMessages(
          state.activeConversationId,
          beforeSortOrder,
          MESSAGES_PAGE_SIZE,
        );
        if (get().activeConversationId !== state.activeConversationId) return;
        set((s) => ({
          activeMessages: [...page.messages, ...s.activeMessages],
          hasMoreMessages: page.hasMore,
          isLoadingMessages: false,
        }));

        // Sync cache with the updated messages (including older pages)
        const updated = get();
        if (updated.activeConversationId) {
          messagesCache.set(updated.activeConversationId, {
            messages: updated.activeMessages,
            hasMore: updated.hasMoreMessages,
          });
        }
      } catch {
        set({ isLoadingMessages: false });
      }
    },

    addMessage: async (conversationId, message) => {
      const _start = performance.now();
      console.log(`[ChatFlow] caller → store.addMessage() [${message.role}]`);
      // Update metadata
      set((state) => ({
        conversations: state.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          const isFirstUserMessage =
            c.title === "New Chat" && message.role === "user";
          return {
            ...c,
            messageCount: c.messageCount + 1,
            updatedAt: new Date().toISOString(),
            title: isFirstUserMessage ? message.content.slice(0, 60) : c.title,
          };
        }),
        // If this is the active conversation, append to activeMessages
        activeMessages:
          state.activeConversationId === conversationId
            ? [...state.activeMessages, message]
            : state.activeMessages,
      }));

      // Sync the messages cache with the appended message
      const currentState = get();
      if (currentState.activeConversationId === conversationId) {
        messagesCache.set(conversationId, {
          messages: currentState.activeMessages,
          hasMore: currentState.hasMoreMessages,
        });
      }

      // Persist the single message to the backend
      const meta = get().conversations.find((c) => c.id === conversationId);
      if (meta) {
        console.log(
          "[ChatFlow] store.addMessage() → window.api.appendChatMessage() [Tauri IPC]",
        );
        await window.api.appendChatMessage(
          conversationId,
          meta.title,
          meta.createdAt,
          meta.updatedAt,
          message,
        );
      }
      const _end = performance.now();
      console.log(
        `[ChatFlow] store.addMessage() [${message.role}] | start: ${_start.toFixed(2)}ms | end: ${_end.toFixed(2)}ms | diff: ${(_end - _start).toFixed(2)}ms`,
      );
    },

    saveConversation: async (_conversationId) => {
      // Messages are now saved individually via addMessage → appendChatMessage.
      // This is kept for backward compatibility but is a no-op.
    },

    removeConversation: async (conversationId) => {
      try {
        await window.api.removeChatConversation(conversationId);
        invalidateConversationCaches(conversationId);
        set((state) => ({
          conversations: state.conversations.filter(
            (c) => c.id !== conversationId,
          ),
          activeConversationId:
            state.activeConversationId === conversationId
              ? null
              : state.activeConversationId,
          activeMessages:
            state.activeConversationId === conversationId
              ? []
              : state.activeMessages,
          hasMoreMessages:
            state.activeConversationId === conversationId
              ? false
              : state.hasMoreMessages,
          activeSources:
            state.activeConversationId === conversationId
              ? []
              : state.activeSources,
          activeCitation:
            state.activeConversationId === conversationId
              ? null
              : state.activeCitation,
          activeToolCalls:
            state.activeConversationId === conversationId
              ? []
              : state.activeToolCalls,
          isLoadingToolCalls:
            state.activeConversationId === conversationId
              ? false
              : state.isLoadingToolCalls,
          toolCallsLoaded:
            state.activeConversationId === conversationId
              ? false
              : state.toolCallsLoaded,
          activitySummaries:
            state.activeConversationId === conversationId
              ? []
              : state.activitySummaries,
          summariesLoaded:
            state.activeConversationId === conversationId
              ? false
              : state.summariesLoaded,
          isLoadingSummaries:
            state.activeConversationId === conversationId
              ? false
              : state.isLoadingSummaries,
          expandedToolCalls:
            state.activeConversationId === conversationId
              ? {}
              : state.expandedToolCalls,
          loadingMessageIds:
            state.activeConversationId === conversationId
              ? []
              : state.loadingMessageIds,
        }));
      } catch {
        // Silently fail
      }
    },

    clearAll: async () => {
      try {
        await window.api.clearChatHistory();
        clearAllChatCaches();
        set({
          conversations: [],
          activeConversationId: null,
          activeMessages: [],
          hasMoreMessages: false,
          activeSources: [],
          activeCitation: null,
          sourcePreview: null,
          activeToolCalls: [],
          isLoadingToolCalls: false,
          toolCallsLoaded: false,
          activitySummaries: [],
          summariesLoaded: false,
          isLoadingSummaries: false,
          expandedToolCalls: {},
          loadingMessageIds: [],
        });
      } catch {
        // Silently fail
      }
    },

    // ─── Sources ─────────────────────────────────────────────────

    loadSources: async (conversationId) => {
      const sources = (await window.api.loadResearchSources(
        conversationId,
      )) as ChatSource[];
      if (get().activeConversationId === conversationId) {
        set({ activeSources: sources });
      }
    },

    addSource: async (source) => {
      // Prevent duplicate sources (same path + type)
      const existing = get().activeSources;
      if (
        existing.some(
          (s) => s.path === source.path && s.sourceType === source.sourceType,
        )
      )
        return;

      const now = new Date().toISOString();
      const full: ChatSource = {
        ...source,
        id: crypto.randomUUID(),
        createdAt: now,
      };
      set((s) => ({
        activeSources: [...s.activeSources, full],
      }));

      // Sync sources cache
      const convId = get().activeConversationId;
      if (convId) {
        sourcesCache.set(convId, get().activeSources);
      }

      await window.api.saveResearchSource(full);
    },

    removeSource: async (sourceId) => {
      set((s) => ({
        activeSources: s.activeSources.filter((src) => src.id !== sourceId),
      }));

      // Sync sources cache
      const convId = get().activeConversationId;
      if (convId) {
        sourcesCache.set(convId, get().activeSources);
      }

      await window.api.removeResearchSource(sourceId);
    },

    // ─── Citation ────────────────────────────────────────────────

    setActiveCitation: (citation) => {
      set({ activeCitation: citation });
    },

    openSourcePreview: (preview) => {
      set({ sourcePreview: preview });
    },

    closeSourcePreview: () => {
      set({ sourcePreview: null });
    },

    // ─── Tool Calls ──────────────────────────────────────────────

    loadToolCalls: async (conversationId) => {
      if (get().toolCallsLoaded || get().isLoadingToolCalls) return;
      set({ isLoadingToolCalls: true });
      try {
        const toolCalls = (await window.api.loadToolCalls(
          conversationId,
        )) as ToolCallRecord[];
        if (get().activeConversationId === conversationId) {
          set({
            activeToolCalls: toolCalls,
            isLoadingToolCalls: false,
            toolCallsLoaded: true,
          });
        }
      } catch {
        set({ isLoadingToolCalls: false, toolCallsLoaded: true });
      }
    },

    saveToolCalls: async (toolCalls) => {
      if (toolCalls.length === 0) return;
      try {
        await window.api.saveToolCalls(toolCalls);
        // Append to activeToolCalls if conversation matches
        const convId = toolCalls[0].conversationId;
        if (get().activeConversationId === convId) {
          const messageId = toolCalls[0].messageId;
          // Build a summary for this new message's tool calls
          const doneCount = toolCalls.filter(
            (t) => t.status !== "running",
          ).length;
          const durations = toolCalls.reduce((sum, t) => {
            if (t.completedAt) {
              return (
                sum +
                Math.max(
                  0,
                  new Date(t.completedAt).getTime() -
                    new Date(t.startedAt).getTime(),
                )
              );
            }
            return sum;
          }, 0);
          const newSummary: ToolCallSummary = {
            messageId,
            totalCount: toolCalls.length,
            doneCount,
            firstStartedAt: toolCalls[0].startedAt,
            lastCompletedAt: toolCalls[toolCalls.length - 1].completedAt,
            totalDurationMs: durations,
          };
          set((s) => ({
            activeToolCalls: [...s.activeToolCalls, ...toolCalls],
            toolCallsLoaded: true,
            activitySummaries: [...s.activitySummaries, newSummary],
            summariesLoaded: true,
            expandedToolCalls: {
              ...s.expandedToolCalls,
              [messageId]: toolCalls,
            },
          }));

          // Sync tool calls cache
          toolCallsCache.set(convId, get().activeToolCalls);
        }
      } catch {
        // Silently fail
      }
    },

    // ─── Two-Level Lazy Loading ──────────────────────────────────

    loadActivitySummaries: async (conversationId) => {
      if (get().summariesLoaded || get().isLoadingSummaries) return;
      set({ isLoadingSummaries: true });
      try {
        const summaries = (await window.api.loadToolCallSummaries(
          conversationId,
        )) as ToolCallSummary[];
        if (get().activeConversationId === conversationId) {
          set({
            activitySummaries: summaries,
            isLoadingSummaries: false,
            summariesLoaded: true,
          });
        } else {
          set({ isLoadingSummaries: false });
        }
      } catch {
        set({ isLoadingSummaries: false, summariesLoaded: true });
      }
    },

    loadMessageToolCalls: async (messageId) => {
      const state = get();
      // Already loaded or currently loading
      if (
        state.expandedToolCalls[messageId] ||
        state.loadingMessageIds.includes(messageId)
      )
        return;
      set((s) => ({ loadingMessageIds: [...s.loadingMessageIds, messageId] }));
      try {
        const toolCalls = (await window.api.loadToolCallsByMessage(
          messageId,
        )) as ToolCallRecord[];
        if (get().loadingMessageIds.includes(messageId)) {
          set((s) => ({
            expandedToolCalls: {
              ...s.expandedToolCalls,
              [messageId]: toolCalls,
            },
            loadingMessageIds: s.loadingMessageIds.filter(
              (id) => id !== messageId,
            ),
          }));
        }
      } catch {
        set((s) => ({
          loadingMessageIds: s.loadingMessageIds.filter(
            (id) => id !== messageId,
          ),
        }));
      }
    },

    getActiveAgentMode: () => {
      const { activeConversationId, agentModeByConversation } = get()
      const key = activeConversationId ?? '__default__'
      return agentModeByConversation[key] ?? useSettingsStore.getState().getAiModeForApp('chat')
    },

    setActiveAgentMode: (mode: AgentMode) => {
      const { activeConversationId } = get()
      const key = activeConversationId ?? '__default__'
      set((s) => ({
        agentModeByConversation: {
          ...s.agentModeByConversation,
          [key]: mode,
        },
      }))
    },
  }),
);
