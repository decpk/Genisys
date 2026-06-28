import { useCallback } from 'react'
import type {
  ExplorerAIMessage,
} from './ExplorerAICommand.types'
import type { ExplorerAIMode } from '../ExplorerAIPanel/ExplorerAIMode.constants'
import { useExplorerAIHistoryStore } from '@/store/explorer-ai-history-store'
import { sendExplorerAIStream, cleanupSessionStreams } from './explorerAIStreamManager'

/**
 * Thin view-layer hook for the Explorer AI panel.
 *
 * All streaming state lives in the Zustand store (per-session).
 * This hook simply reads the active session's state and provides
 * action callbacks. Multiple sessions can stream simultaneously
 * in the background — switching sessions just changes the view.
 */
export function useExplorerAICommand(
  rootPath: string,
  onRefresh?: () => void,
  operationMode: ExplorerAIMode = 'auto-safe',
) {
  // ── Read active session state from the store ──
  const activeSessionId = useExplorerAIHistoryStore((s) => s.activeSessionId)
  const session = useExplorerAIHistoryStore((s) =>
    s.activeSessionId ? s.sessions.find((sess) => sess.id === s.activeSessionId) : undefined,
  )

  const status = session?.status ?? 'idle'
  const messages = session?.messages ?? []
  const streamingContent = session?.streamingContent ?? ''
  const pendingConfirm = session?.pendingConfirm ?? null
  const pendingShellConfirm = session?.pendingShellConfirm ?? null;
  const toolActivities = session?.toolActivities ?? [];
  const error = session?.error ?? null;

  // ── Actions ──
  // Note: actions read activeSessionId from the store at call-time via
  // getState() to avoid stale closures (e.g. when createSession() is
  // called in the same tick as sendInstruction()).

  const sendInstruction = useCallback(
    (instruction: string) => {
      const sessionId = useExplorerAIHistoryStore.getState().activeSessionId;
      if (!sessionId) return;
      sendExplorerAIStream(
        sessionId,
        rootPath,
        instruction,
        operationMode,
        onRefresh,
      );
    },
    [rootPath, operationMode, onRefresh],
  );

  const confirmAction = useCallback(() => {
    const sessionId = useExplorerAIHistoryStore.getState().activeSessionId;
    if (!sessionId) return;
    const store = useExplorerAIHistoryStore.getState();
    store.updateSession(sessionId, { pendingConfirm: null });
    sendExplorerAIStream(
      sessionId,
      rootPath,
      "CONFIRMED — proceed with the operation described above.",
      operationMode,
      onRefresh,
    );
  }, [rootPath, operationMode, onRefresh]);

  const cancelAction = useCallback(() => {
    const sessionId = useExplorerAIHistoryStore.getState().activeSessionId;
    if (!sessionId) return;
    const store = useExplorerAIHistoryStore.getState();
    store.updateSession(sessionId, { pendingConfirm: null, status: "done" });
    const cancelMsg: ExplorerAIMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Operation cancelled by user.",
    };
    store.addMessage(sessionId, cancelMsg);
  }, []);

  /** Approve or deny a pending shell command (hard gate before execution). */
  const respondShell = useCallback((approved: boolean) => {
    const sessionId = useExplorerAIHistoryStore.getState().activeSessionId;
    if (!sessionId) return;
    const store = useExplorerAIHistoryStore.getState();
    const pending = store.getSession(sessionId)?.pendingShellConfirm;
    if (!pending) return;
    store.updateSession(sessionId, { pendingShellConfirm: null });
    void window.api.respondExplorerAIShellConfirm({
      confirmId: pending.confirmId,
      approved,
    });
  }, []);

  /** Stop the in-flight stream, finalizing any partial output as a message. */
  const stopStream = useCallback(() => {
    const store = useExplorerAIHistoryStore.getState();
    const sessionId = store.activeSessionId;
    if (!sessionId) return;
    const session = store.getSession(sessionId);
    if (!session) return;

    // Detach listeners so backend tokens stop mutating the store.
    cleanupSessionStreams(sessionId);

    // Persist whatever was streamed so far so it isn't lost.
    const partial = session.streamingContent.trim();
    if (partial) {
      store.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: partial,
      });
    }

    store.markAllToolsDone(sessionId);
    store.updateSession(sessionId, {
      status: "idle",
      streamingContent: "",
      activeStreamId: null,
    });
  }, []);

  const resetSession = useCallback(() => {
    const sessionId = useExplorerAIHistoryStore.getState().activeSessionId
    if (!sessionId) return
    cleanupSessionStreams(sessionId)
    useExplorerAIHistoryStore.getState().resetSession(sessionId)
  }, [])

  return {
    status,
    messages,
    streamingContent,
    pendingConfirm,
    pendingShellConfirm,
    toolActivities,
    error,
    sendInstruction,
    confirmAction,
    cancelAction,
    respondShell,
    stopStream,
    resetSession,
  };
}
