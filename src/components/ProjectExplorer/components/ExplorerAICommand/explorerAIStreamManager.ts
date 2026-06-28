/**
 * Module-level stream manager for Explorer AI.
 *
 * Manages multiple concurrent Tauri streams, each tied to a session.
 * Listeners route events directly into the Zustand store so streams
 * keep running in the background regardless of which session is viewed.
 */

import type { ExplorerConfirmAction, ToolActivity } from './ExplorerAICommand.types'
import { useExplorerAIHistoryStore } from '@/store/explorer-ai-history-store'
import { MODE_SYSTEM_INSTRUCTIONS, type ExplorerAIMode } from '../ExplorerAIPanel/ExplorerAIMode.constants'
import { TOOL_LABELS } from './constants/toolLabels'
import { useSettingsStore } from '@/store/settings-store'
import { DEFAULT_PANEL_AI_CONFIG } from '@/store/panel-ai-config.constants'
import { resolveAppModel } from '@/lib/resolveAppModel'

const EXPLORER_PANEL_APP_ID = 'explorer'

// ─── Per-stream context (module-level, not React state) ──────────

interface StreamContext {
  sessionId: string
  rootPath: string
  contentBuffer: string
  pendingRAF: boolean
  lastEventTime: number
  staleCheckTimer: ReturnType<typeof setInterval> | null
  cleanupFns: (() => void)[]
}

const activeStreams = new Map<string, StreamContext>()

/**
 * True while at least one Explorer AI stream is running for the given root.
 * Used by the FS auto-refresh watcher to suppress noisy per-operation refreshes
 * mid-run — the stream manager already triggers a single refresh when the turn
 * completes.
 */
export function isExplorerAIStreamActiveForRoot(rootPath: string): boolean {
  for (const ctx of activeStreams.values()) {
    if (ctx.rootPath === rootPath) return true
  }
  return false
}

// ─── Helpers ─────────────────────────────────────────────────────

function flushContent(streamId: string): void {
  const ctx = activeStreams.get(streamId)
  if (!ctx) return
  const store = useExplorerAIHistoryStore.getState()
  store.updateSession(ctx.sessionId, { streamingContent: ctx.contentBuffer })
}

function cleanupStream(streamId: string): void {
  const ctx = activeStreams.get(streamId)
  if (!ctx) return
  ctx.cleanupFns.forEach((fn) => fn())
  if (ctx.staleCheckTimer) clearInterval(ctx.staleCheckTimer)
  activeStreams.delete(streamId)
}

/** Clean up all streams for a session (e.g. when session is removed). */
export function cleanupSessionStreams(sessionId: string): void {
  for (const [streamId, ctx] of activeStreams) {
    if (ctx.sessionId === sessionId) {
      cleanupStream(streamId)
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────

export function sendExplorerAIStream(
  sessionId: string,
  rootPath: string,
  instruction: string,
  operationMode: ExplorerAIMode,
  onRefresh?: () => void,
): void {
  const store = useExplorerAIHistoryStore.getState()
  const session = store.getSession(sessionId)
  if (!session) return

  const streamId = crypto.randomUUID()

  // ── Reset session streaming state for the new instruction ──
  store.updateSession(sessionId, {
    status: 'thinking',
    streamingContent: '',
    error: null,
    pendingConfirm: null,
    toolActivities: [],
    activeStreamId: streamId,
  })

  // Add user message
  const userMsg = { id: crypto.randomUUID(), role: 'user' as const, content: instruction }
  store.addMessage(sessionId, userMsg)

  // ── Create stream context ──
  const ctx: StreamContext = {
    sessionId,
    rootPath,
    contentBuffer: '',
    pendingRAF: false,
    lastEventTime: Date.now(),
    staleCheckTimer: null,
    cleanupFns: [],
  }
  activeStreams.set(streamId, ctx)

  // ── Guard: ensure this stream is still the active one for its session ──
  const isActive = () => {
    const s = useExplorerAIHistoryStore.getState().getSession(sessionId)
    return s?.activeStreamId === streamId
  }

  const touch = () => { ctx.lastEventTime = Date.now() }

  // ── Listeners ──

  const unChunk = window.api.onExplorerAIChunk(
    (data: { streamId: string; token: string }) => {
      if (data.streamId !== streamId || !isActive()) return
      touch()
      ctx.contentBuffer += data.token
      if (!ctx.pendingRAF) {
        ctx.pendingRAF = true
        requestAnimationFrame(() => {
          ctx.pendingRAF = false
          flushContent(streamId)
        })
      }
    },
  )

  const unDone = window.api.onExplorerAIDone((data: { streamId: string }) => {
    if (data.streamId !== streamId || !isActive()) return
    touch()

    const finalContent = ctx.contentBuffer
    const storeNow = useExplorerAIHistoryStore.getState()

    if (finalContent) {
      // Check for explorer-confirm blocks
      const confirmMatch = finalContent.match(
        /```explorer-confirm\n([\s\S]*?)\n```/,
      )

      const assistantMsg = { id: crypto.randomUUID(), role: 'assistant' as const, content: finalContent }
      storeNow.addMessage(sessionId, assistantMsg)

      if (confirmMatch) {
        try {
          const confirmData = JSON.parse(confirmMatch[1]) as ExplorerConfirmAction
          storeNow.updateSession(sessionId, {
            status: 'awaiting-confirmation',
            pendingConfirm: confirmData,
            streamingContent: '',
          })
        } catch {
          storeNow.updateSession(sessionId, { status: 'done', streamingContent: '' })
        }
      } else {
        storeNow.updateSession(sessionId, { status: 'done', streamingContent: '' })
      }

      // If any write operations happened, refresh
      const sess = storeNow.getSession(sessionId)
      const mutatingTools = [
        "delete_item",
        "rename_item",
        "move_item",
        "create_file",
        "create_folder",
        "copy_item",
        "write_file",
        "run_shell_command",
      ];
      const hadMutatingTool = (sess?.toolActivities ?? []).some(
        (ta) => mutatingTools.includes(ta.toolName) && ta.status === 'done' && ta.result && !ta.result.startsWith('Error'),
      )
      if (
        hadMutatingTool ||
        finalContent.includes('Created file:') ||
        finalContent.includes('Created folder:') ||
        finalContent.includes('Deleted ') ||
        finalContent.includes('Renamed:') ||
        finalContent.includes('Moved:') ||
        finalContent.includes('Copied ')
      ) {
        onRefresh?.()
      }
    } else {
      const currentSession = storeNow.getSession(sessionId)
      if (currentSession?.status !== 'error') {
        storeNow.updateSession(sessionId, { status: 'done', streamingContent: '' })
      }
    }

    storeNow.markAllToolsDone(sessionId)
    cleanupStream(streamId)
  })

  const unError = window.api.onExplorerAIError(
    (data: { streamId: string; error: string }) => {
      if (data.streamId !== streamId || !isActive()) return
      touch()
      const storeNow = useExplorerAIHistoryStore.getState()
      storeNow.updateSession(sessionId, {
        status: 'error',
        error: data.error,
        streamingContent: '',
      })
      cleanupStream(streamId)
    },
  )

  const unToolStart = window.api.onExplorerAIToolStart(
    (data: { streamId: string; toolName: string; args: Record<string, unknown> }) => {
      if (data.streamId !== streamId || !isActive()) return
      touch()
      const activity: ToolActivity = { toolName: data.toolName, label: TOOL_LABELS[data.toolName], args: data.args, status: 'running' }
      useExplorerAIHistoryStore.getState().addToolActivity(sessionId, activity)
    },
  )

  const unToolResult = window.api.onExplorerAIToolResult(
    (data: { streamId: string; toolName: string; result: string }) => {
      if (data.streamId !== streamId || !isActive()) return
      touch()
      useExplorerAIHistoryStore.getState().updateToolActivity(sessionId, data.toolName, data.result)
    },
  )

  const unShellConfirm = window.api.onExplorerAIShellConfirmRequest(
    (data: {
      streamId: string;
      confirmId: string;
      command: string;
      cwd?: string | null;
    }) => {
      if (data.streamId !== streamId || !isActive()) return;
      touch();
      useExplorerAIHistoryStore.getState().updateSession(sessionId, {
        pendingShellConfirm: {
          confirmId: data.confirmId,
          command: data.command,
          cwd: data.cwd ?? undefined,
        },
      });
    },
  );

  // Stale connection check: if no events for 120s, force error
  ctx.staleCheckTimer = setInterval(() => {
    // Don't time out while we're waiting for the user to approve a shell command.
    const sess = useExplorerAIHistoryStore.getState().getSession(sessionId);
    if (sess?.pendingShellConfirm) {
      touch();
      return;
    }
    const elapsed = Date.now() - ctx.lastEventTime;
    if (elapsed > 120_000) {
      const storeNow = useExplorerAIHistoryStore.getState();
      storeNow.updateSession(sessionId, {
        status: "error",
        error: "Connection timed out — no response received. Try again.",
        streamingContent: "",
      });
      storeNow.markAllToolsDone(sessionId);
      cleanupStream(streamId);
    }
  }, 5000)

  ctx.cleanupFns = [
    unChunk,
    unDone,
    unError,
    unToolStart,
    unToolResult,
    unShellConfirm,
  ];

  // ── Send the instruction to the backend ──
  const conversationHistoryForAPI =
    session.conversationHistory.length > 0
      ? session.conversationHistory
      : undefined

  const modeInstruction = MODE_SYSTEM_INSTRUCTIONS[operationMode]
  const finalInstruction = modeInstruction
    ? `[System: ${modeInstruction}]\n\n${instruction}`
    : instruction

  // Resolve the user's per-panel AI config (model + max_tools) at
  // call-time. Reading from the store directly (rather than threading
  // through the React hook) keeps the manager surface small and
  // mirrors how it already reads `useExplorerAIHistoryStore.getState()`.
  const panelConfigPartial =
    useSettingsStore.getState().panelAIConfigs[EXPLORER_PANEL_APP_ID]
  const panelConfig = { ...DEFAULT_PANEL_AI_CONFIG, ...panelConfigPartial }

  window.api.sendExplorerAICommand({
    streamId,
    rootPath,
    instruction: finalInstruction,
    conversationHistory: conversationHistoryForAPI,
    model: resolveAppModel(EXPLORER_PANEL_APP_ID),
    maxTools: panelConfig.maxTools,
  })
}
