import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { BookOpen, TextSelect } from 'lucide-react'

import { useLibraryStore, type Chapter } from '@/store/library-store'
import type {
  AIAssistantPanelData,
  AIAssistantPanelActions,
  AIConfirmAction,
  AIContextItem,
  AIMentionConfig,
  AIMentionItem,
  AIMessage,
  AIStatus,
  AIToolActivity,
} from '@/right-panels/AIAssistantPanel'
import {
  useAIAssistantHistory,
  useActionResolution,
  useAIPanelModelSelection,
  usePendingContinue,
} from '@/right-panels/AIAssistantPanel'
import { resolveAppModel } from '@/lib/resolveAppModel'
import { useLibraryAIContext } from './LibraryAIContext'
import { useSettingsStore } from '@/store/settings-store'
import { AGENT_MODES, type AgentMode } from '@/components/Chat/components/AgentModeSelector'
import { playCompletionChime } from '@/lib/audio-completion'
import { buildModeAwareSystemPrompt } from '@/lib/buildModeAwareSystemPrompt'
import { isAutoApproveAgentMode } from '@/lib/ai-assistant-auto-approve'
import { useLatestRef } from '@/hooks/useLatestRef'
import { runLibraryAI } from './ai/runner'
import { buildLibrarySystemPrompt } from '@/prompts/librarySystemPrompt'

interface LibraryAIAssistantReturn {
  data: AIAssistantPanelData
  actions: AIAssistantPanelActions
}

export function useLibraryAIAssistantData(): LibraryAIAssistantReturn {
  const activeBook = useLibraryStore((s) => s.activeBook);
  const activeChapterId = useLibraryStore((s) => s.activeChapterId);
  const { registerSelectionListener } = useLibraryAIContext();

  // Derive the active chapter from the book's chapters
  const activeChapter = useMemo(
    () => activeBook?.chapters.find((ch) => ch.id === activeChapterId) ?? null,
    [activeBook?.chapters, activeChapterId],
  );

  const [contextItems, setContextItems] = useState<AIContextItem[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [status, setStatus] = useState<AIStatus>("idle");
  const [streamingContent, setStreamingContent] = useState("");
  const [toolActivities, setToolActivities] = useState<AIToolActivity[]>([]);
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<AIConfirmAction | null>(null);

  const settingsMode = useSettingsStore((s) => s.getAiModeForApp('library'));
  const [sessionModeOverride, setSessionModeOverride] = useState<AgentMode | null>(null);
  const activeMode = sessionModeOverride ?? settingsMode;
  const activeModeRef = useLatestRef(activeMode);

  // ── Persistent history via shared hook ─────────────────────
  const history = useAIAssistantHistory("library");

  // ── Model selection (per-app override → global default) ────
  const { selectedModelId, onModelChange } = useAIPanelModelSelection("library");

  // Owns the "tool budget exhausted, continue?" UX state
  const continueState = usePendingContinue();
  const { reset: resetContinue } = continueState;

  // Store full context data (chapter content / selected text) keyed by context item ID
  const contextDataRef = useRef<Map<string, string>>(new Map());
  // Conversation ID for the streaming backend (persists messages in DB)
  const conversationIdRef = useRef<string | null>(null);
  // Active session ID for the current chat (local tracking)
  const activeSessionIdRef = useRef<string | null>(null);
  // Request counter for soft-cancelling in-flight runs (onStop)
  const requestRef = useRef(0);
  // Buffer for rAF-batched streaming content
  const streamBufferRef = useRef("");
  const rafIdRef = useRef<number | null>(null);
  // Refs to avoid stale closures in stream event listeners
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const historyRef = useRef(history);
  historyRef.current = history;
  // Pending confirm promise resolver (destructive tool confirmation)
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  // ── Context item management ────────────────────────────────

  const removeContextItem = useCallback((id: string) => {
    setContextItems((prev) => prev.filter((item) => item.id !== id));
    contextDataRef.current.delete(id);
  }, []);

  const addChapterContext = useCallback(
    async (chapter: Chapter) => {
      const itemId = `chapter-${chapter.id}`;

      // Skip if already added
      if (contextDataRef.current.has(itemId)) return;

      // Load content from DB if not already in memory (chapters are lazy-loaded)
      let content = chapter.content;
      if (!content) {
        content =
          ((await window.api.loadChapterContent(chapter.id)) as string) ?? "";
      }

      contextDataRef.current.set(
        itemId,
        `## Chapter ${chapter.chapterNumber}: ${chapter.title}\n\n${content}`,
      );
      setContextItems((prev) => {
        if (prev.some((item) => item.id === itemId)) return prev;
        const item: AIContextItem = {
          id: itemId,
          label: `Ch. ${chapter.chapterNumber} — ${chapter.title}`,
          icon: BookOpen,
          onRemove: () => removeContextItem(itemId),
        };
        return [...prev, item];
      });
    },
    [removeContextItem],
  );

  const addSelectionContext = useCallback(
    (text: string, chapterTitle: string) => {
      const id = `selection-${Date.now()}`;
      const truncated = text.length > 60 ? text.slice(0, 60) + "…" : text;
      contextDataRef.current.set(
        id,
        `[Selected text from "${chapterTitle}"]\n\n${text}`,
      );
      const item: AIContextItem = {
        id,
        label: `Selected from "${chapterTitle}"`,
        sublabel: truncated,
        icon: TextSelect,
        onRemove: () => removeContextItem(id),
      };
      setContextItems((prev) => [...prev, item]);
    },
    [removeContextItem],
  );

  // ── Listen for text selections from ChapterViewer ──────────

  useEffect(() => {
    return registerSelectionListener(addSelectionContext);
  }, [registerSelectionListener, addSelectionContext]);

  // ── @ Mention config (chapters list) ───────────────────────

  const mentionConfig: AIMentionConfig = useMemo(
    () => ({
      char: "@",
      menuLabel: "Chapters",
      fetchItems: async (query: string): Promise<AIMentionItem[]> => {
        const chapters = activeBook?.chapters ?? [];
        const q = query.toLowerCase();
        return chapters
          .filter(
            (ch) =>
              ch.status === "completed" &&
              (q === "" || ch.title.toLowerCase().includes(q)),
          )
          .map((ch) => ({
            id: ch.id,
            label: `Ch. ${ch.chapterNumber} — ${ch.title}`,
            icon: BookOpen,
          }));
      },
    }),
    [activeBook?.chapters],
  );

  // ── Build context string for AI prompt ─────────────────────

  const buildContextString = useCallback((): string => {
    const parts: string[] = [];

    // Always include the active chapter the user is currently reading
    if (activeChapter?.content) {
      parts.push(
        `## Currently reading — Chapter ${activeChapter.chapterNumber}: ${activeChapter.title}\n\n${activeChapter.content}`,
      );
    }

    // Include any explicitly added context (selected text, @-mentioned chapters)
    for (const [, data] of contextDataRef.current) {
      parts.push(data);
    }
    return parts.length > 0
      ? `\n\n--- CONTEXT ---\n${parts.join("\n\n---\n\n")}\n--- END CONTEXT ---`
      : "";
  }, [activeChapter]);

  // ── Build conversation history for the runner ──────────────

  const buildConversationHistory = useCallback(() => {
    return messagesRef.current.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, []);

  // ── sendMessage ────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string, mentions?: string[]) => {
      // Resolve mentioned chapter IDs → load content and add as context items
      if (mentions?.length && activeBook) {
        const chapterLoads = mentions
          .map((id) => activeBook.chapters.find((ch) => ch.id === id))
          .filter(Boolean) as Chapter[];
        await Promise.all(chapterLoads.map((ch) => addChapterContext(ch)));
      }

      // Add user message to UI
      const userMsg: AIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setStatus("thinking");
      setError(null);
      setStreamingContent("");
      setToolActivities([]);
      setStreamingReasoning("");
      streamBufferRef.current = "";

      const requestId = ++requestRef.current;

      // Local accumulators feed the persisted assistant message at
      // onDone-time so we don't race React state batching.
      let reasoningBuffer = "";
      const activitiesBuffer: AIToolActivity[] = [];

      try {
        // Ensure we have a conversation ID (creates one on first message)
        if (!conversationIdRef.current) {
          conversationIdRef.current = crypto.randomUUID();
        }
        // Ensure we have a session ID for persistent history
        if (!activeSessionIdRef.current) {
          activeSessionIdRef.current = crypto.randomUUID();
          history.registerSessionConversation(
            activeSessionIdRef.current,
            conversationIdRef.current,
          );
        }
        const convId = conversationIdRef.current;
        const now = new Date().toISOString();

        // Persist user message to DB so the backend can load it
        await window.api.appendChatMessage(
          convId,
          `Library AI: ${activeBook?.book.title ?? "Chat"}`,
          now,
          now,
          {
            id: userMsg.id,
            role: "user",
            content: text,
            timestamp: now,
          },
        );

        // Build the mode-aware system prompt with book/chapter context
        const fullSystemPrompt = buildModeAwareSystemPrompt(
          buildLibrarySystemPrompt() + buildContextString(),
          activeMode,
        );
        const conversationHistory = buildConversationHistory();
        // Remove the last message (the one we just added) — runner re-adds it.
        conversationHistory.pop();

        if (requestRef.current !== requestId) return;

        await runLibraryAI(
          fullSystemPrompt,
          conversationHistory,
          text,
          {
            onChunk: (token) => {
              if (requestRef.current !== requestId) return;
              streamBufferRef.current += token;
              if (rafIdRef.current === null) {
                rafIdRef.current = requestAnimationFrame(() => {
                  rafIdRef.current = null;
                  setStreamingContent(streamBufferRef.current);
                });
              }
            },
            onReasoningChunk: (token) => {
              if (requestRef.current !== requestId) return;
              reasoningBuffer += token;
              setStreamingReasoning((prev) => prev + token);
            },
            onToolStart: (activity) => {
              if (requestRef.current !== requestId) return;
              activitiesBuffer.push(activity);
              setStatus("executing");
              setToolActivities((prev) => [...prev, activity]);
            },
            onToolResult: (toolName) => {
              if (requestRef.current !== requestId) return;
              for (let i = activitiesBuffer.length - 1; i >= 0; i--) {
                if (
                  activitiesBuffer[i].toolName === toolName &&
                  activitiesBuffer[i].status === "running"
                ) {
                  activitiesBuffer[i] = { ...activitiesBuffer[i], status: "done" };
                  break;
                }
              }
              setToolActivities((prev) =>
                prev.map((a) =>
                  a.toolName === toolName && a.status === "running"
                    ? { ...a, status: "done" as const }
                    : a,
                ),
              );
            },
            onConfirmRequired: (confirmActionPayload) => {
              return new Promise<boolean>((resolve) => {
                if (requestRef.current !== requestId) {
                  resolve(false);
                  return;
                }
                setPendingConfirm(confirmActionPayload);
                setStatus("awaiting-confirmation");
                confirmResolverRef.current = resolve;
              });
            },
            isAutoApprove: () => isAutoApproveAgentMode(activeModeRef.current),
            onContinueRequired: continueState.onContinueRequired,
            onDone: async (content) => {
              if (requestRef.current !== requestId) return;
              streamBufferRef.current = "";
              if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
              }
              setStreamingContent("");
              setStreamingReasoning("");
              setStatus("idle");
              playCompletionChime("success");
              if (content) {
                const assistantMsg: AIMessage = {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  content,
                  ...(reasoningBuffer ? { reasoning: reasoningBuffer } : {}),
                  ...(activitiesBuffer.length > 0
                    ? { activities: activitiesBuffer }
                    : {}),
                };
                setMessages((prev) => [...prev, assistantMsg]);

                // Persist assistant message to DB
                const convId2 = conversationIdRef.current;
                if (convId2) {
                  const now2 = new Date().toISOString();
                  window.api
                    .appendChatMessage(convId2, "", now2, now2, {
                      id: assistantMsg.id,
                      role: "assistant",
                      content,
                      timestamp: now2,
                      reasoning: reasoningBuffer || undefined,
                      activitiesJson:
                        activitiesBuffer.length > 0
                          ? JSON.stringify(activitiesBuffer)
                          : undefined,
                    })
                    .catch(() => {});

                  const firstUserMsg =
                    messagesRef.current.find((m) => m.role === "user")
                      ?.content ?? "Chat";
                  historyRef.current.saveCurrentSession(
                    convId2,
                    firstUserMsg,
                    activeSessionIdRef.current ?? undefined,
                  );
                }
              }
            },
            onError: (errorMsg) => {
              if (requestRef.current !== requestId) return;
              streamBufferRef.current = "";
              if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
              }
              setStreamingContent("");
              setStreamingReasoning("");
              setStatus("idle");
              setError(errorMsg);
              playCompletionChime("error");
            },
          },
          { mode: activeModeRef.current, model: resolveAppModel("library") },
        );
      } catch (err) {
        setStatus("idle");
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      }
    },
    [
      activeBook,
      addChapterContext,
      buildContextString,
      buildConversationHistory,
      history,
      activeMode,
      activeModeRef,
      continueState.onContinueRequired,
    ],
  );

  // ── Confirmation handlers ─────────────────────────

  const confirmAction = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(true);
      confirmResolverRef.current = null;
    }
    setPendingConfirm(null);
    setStatus("executing");
  }, []);

  const cancelAction = useCallback(() => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
    setPendingConfirm(null);
    setStatus("executing");
  }, []);

  // ── Session helpers ─────────────────────────────────────────

  /** Clear the active state (messages, streaming, context, stream). */
  const clearActiveState = useCallback(() => {
    streamBufferRef.current = "";
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    conversationIdRef.current = null;
    activeSessionIdRef.current = null;
    confirmResolverRef.current = null;
    resetContinue();
    setMessages([]);
    setStatus("idle");
    setStreamingContent("");
    setStreamingReasoning("");
    setToolActivities([]);
    setPendingConfirm(null);
    setError(null);
    setContextItems([]);
    contextDataRef.current.clear();
  }, [resetContinue]);

  // ── resetSession ───────────────────────────────────────────

  const resetSession = useCallback(() => {
    // If the active session is in history, remove it from DB
    if (activeSessionIdRef.current) {
      history.removeSession(activeSessionIdRef.current);
    } else if (conversationIdRef.current) {
      // No session but has conversation — remove the conversation directly
      window.api
        .removeChatConversation(conversationIdRef.current)
        .catch(() => {});
    }
    clearActiveState();
  }, [history, clearActiveState]);

  // ── createSession (+ button) ───────────────────────────────

  const createSession = useCallback(() => {
    // Save current chat to history if it has messages
    if (messages.length > 0 && conversationIdRef.current) {
      const firstUserMsg =
        messages.find((m) => m.role === "user")?.content ?? "Chat";
      history.saveCurrentSession(
        conversationIdRef.current,
        firstUserMsg,
        activeSessionIdRef.current ?? undefined,
      );
    }

    // Start fresh
    clearActiveState();
  }, [messages, history, clearActiveState]);

  // ── selectSession (click on history item) ──────────────────

  const selectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionIdRef.current) return;

      // Save current chat first if it has messages and a conversation
      if (messages.length > 0 && conversationIdRef.current) {
        const firstUserMsg =
          messages.find((m) => m.role === "user")?.content ?? "Chat";
        history.saveCurrentSession(
          conversationIdRef.current,
          firstUserMsg,
          activeSessionIdRef.current ?? undefined,
        );
      }

      // Clear current state
      streamBufferRef.current = "";
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setStatus("idle");
      setStreamingContent("");
      setError(null);
      setContextItems([]);
      contextDataRef.current.clear();

      // Set the session as active
      activeSessionIdRef.current = sessionId;
      const convId = history.getConversationId(sessionId);
      conversationIdRef.current = convId;

      // Delegate to history hook which lazy-loads messages from DB
      history.selectSession(sessionId);
    },
    [messages, history],
  );

  // When history hook loads messages for a selected session, sync them to local state
  useEffect(() => {
    if (
      history.activeSessionId &&
      history.activeSessionId === activeSessionIdRef.current
    ) {
      setMessages(history.historicalMessages);
    }
  }, [history.activeSessionId, history.historicalMessages]);

  // ── removeSession ──────────────────────────────────────────

  const removeSession = useCallback(
    (sessionId: string) => {
      history.removeSession(sessionId);

      // If removing the active session, clear state
      if (sessionId === activeSessionIdRef.current) {
        clearActiveState();
      }
    },
    [history, clearActiveState],
  );

  // ── clearAllSessions ───────────────────────────────────────

  const clearAllSessions = useCallback(() => {
    history.clearAllSessions(activeSessionIdRef.current ?? undefined);
  }, [history]);

  // ── Action resolution (Implement / Refine / Cancel) ────────

  const {
    resolvedActionMessageIds,
    resolvedActionByMessageId,
    onActionClick,
  } = useActionResolution({
    sendMessage,
    setAgentMode: useCallback(() => setSessionModeOverride('agent'), []),
    confirmAction,
    pendingConfirm,
    status,
  });

  const onStop = useCallback(() => {
    requestRef.current++;
    streamBufferRef.current = "";
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
    setPendingConfirm(null);
    resetContinue();
    setStreamingContent("");
    setStreamingReasoning("");
    setToolActivities((prev) =>
      prev.map((a) => (a.status === "running" ? { ...a, status: "done" as const } : a)),
    );
    setStatus("idle");
  }, [resetContinue]);

  // ── Assemble data + actions ────────────────────────────────

  const data: AIAssistantPanelData = useMemo(
    () => ({
      messages,
      status,
      streamingContent,
      toolActivities,
      streamingReasoning,
      error,
      pendingConfirm,
      pendingContinue: continueState.pendingContinue,
      sessions: history.sessions,
      activeSessionId: history.activeSessionId,
      contextItems,
      contextLabel: contextItems.length > 0 ? "Context" : undefined,
      emptyState: {
        title: "Ask AI about this book",
        suggestions: [
          '"Summarize this chapter"',
          '"Explain the key concepts"',
          '"Create a quiz from @chapter"',
        ],
      },
      mentionConfig,
      placeholder: "Ask about this book… (@ to mention chapters)",
      modes: AGENT_MODES,
      selectedMode: activeMode,
      selectedModelId,
      appId: 'library',
      isLoadingHistory: history.isLoadingHistory,
      isLoadingMessages: history.isLoadingMessages,
      hasMoreMessages: history.hasMoreMessages,
      resolvedActionMessageIds,
      resolvedActionByMessageId,
    }),
    [
      messages,
      status,
      streamingContent,
      toolActivities,
      streamingReasoning,
      error,
      pendingConfirm,
      continueState.pendingContinue,
      history.sessions,
      history.activeSessionId,
      history.isLoadingHistory,
      history.isLoadingMessages,
      history.hasMoreMessages,
      contextItems,
      mentionConfig,
      activeMode,
      selectedModelId,
      resolvedActionMessageIds,
      resolvedActionByMessageId,
    ],
  );

  const actions: AIAssistantPanelActions = useMemo(
    () => ({
      sendMessage:
        sendMessage as unknown as AIAssistantPanelActions["sendMessage"],
      confirmAction,
      cancelAction,
      onStop,
      continueLoop: continueState.continueLoop,
      stopLoop: continueState.stopLoop,
      resetSession,
      createSession,
      selectSession,
      removeSession,
      clearAllSessions,
      onModeChange: ((modeId: string) => setSessionModeOverride(modeId as AgentMode)) as AIAssistantPanelActions["onModeChange"],
      onModelChange,
      loadMoreMessages: history.loadMoreMessages,
      onActionClick,
    }),
    [
      sendMessage,
      confirmAction,
      cancelAction,
      onStop,
      continueState.continueLoop,
      continueState.stopLoop,
      resetSession,
      createSession,
      selectSession,
      removeSession,
      clearAllSessions,
      onModelChange,
      history.loadMoreMessages,
      onActionClick,
    ],
  );

  return { data, actions };
}
