// Capture engine for standalone-Terminal scrollback persistence.
//
// Holds the module-scoped registry of per-session output subscriptions and the
// debounced "serialize current buffer → save to disk" logic. Kept out of the
// React hook so it can be driven imperatively (the hook reconciles it on tree
// changes) AND poked synchronously by store actions (`dropSession` on close, to
// cancel any pending save before the file is deleted). One snapshot is written
// per tab under its stable `persistentId`.

import { terminalOutputBus } from '@/components/Terminal/utils/terminalOutputBus'
import type { TermTab } from '@/store/terminal-app-store/types'

import { serializeSurface } from '../components/TerminalAppSurface/terminalAppSurfacePool'
import { saveTerminalSession } from './terminalSessionStore'

/** Quiet period after the last output chunk before a snapshot is written. */
const DEBOUNCE_MS = 800
/** Hard cap so a continuously-streaming tab still gets persisted periodically. */
const MAX_WAIT_MS = 4000

interface CaptureEntry {
  persistentId: string
  unsub: () => void
  timer: ReturnType<typeof setTimeout> | null
  lastSavedAt: number
}

const entries = new Map<string, CaptureEntry>()

/** Serialize a session's current buffer and persist it under its stable key. */
function saveNow(sessionId: string, persistentId: string): void {
  const entry = entries.get(sessionId)
  if (entry?.timer) {
    clearTimeout(entry.timer)
    entry.timer = null
  }
  if (entry) entry.lastSavedAt = Date.now()
  const data = serializeSurface(sessionId)
  // `null` = no live surface yet; don't clobber a good file with nothing.
  if (data === null) return
  void saveTerminalSession(persistentId, data)
}

/** Debounce a save, forcing a flush once output has streamed past the max wait. */
function scheduleSave(sessionId: string, persistentId: string): void {
  const entry = entries.get(sessionId)
  if (!entry) return
  if (Date.now() - entry.lastSavedAt >= MAX_WAIT_MS) {
    saveNow(sessionId, persistentId)
    return
  }
  if (entry.timer) clearTimeout(entry.timer)
  entry.timer = setTimeout(() => saveNow(sessionId, persistentId), DEBOUNCE_MS)
}

/** Start capturing a live session's output (idempotent). */
function trackSession(sessionId: string, persistentId: string): void {
  const existing = entries.get(sessionId)
  if (existing) {
    existing.persistentId = persistentId
    return
  }
  const unsub = terminalOutputBus.subscribeOutput(sessionId, () => {
    scheduleSave(sessionId, persistentId)
  })
  entries.set(sessionId, { persistentId, unsub, timer: null, lastSavedAt: 0 })
}

/** Stop capturing a session, optionally writing one final snapshot. */
function untrackSession(sessionId: string, saveFinal: boolean): void {
  const entry = entries.get(sessionId)
  if (!entry) return
  if (entry.timer) clearTimeout(entry.timer)
  if (saveFinal) {
    const data = serializeSurface(sessionId)
    if (data !== null) void saveTerminalSession(entry.persistentId, data)
  }
  entry.unsub()
  entries.delete(sessionId)
}

/**
 * Reconcile the capture registry with the current tab set: track new live tabs,
 * write a final snapshot for tabs that just exited (kept in the tree), and drop
 * tabs that vanished (closed — their file is already deleted, so no save).
 */
export function reconcileCapture(tabs: TermTab[]): void {
  const allIds = new Set(tabs.map((t) => t.id))
  const liveTabs = tabs.filter((t) => !t.exited)
  const liveIds = new Set(liveTabs.map((t) => t.id))

  liveTabs.forEach((t) => trackSession(t.id, t.persistentId))

  for (const sessionId of [...entries.keys()]) {
    if (liveIds.has(sessionId)) continue
    untrackSession(sessionId, allIds.has(sessionId))
  }
}

/**
 * Synchronously stop capturing a session WITHOUT saving — cancels any pending
 * debounced save and unsubscribes. Called from the close actions right before
 * the saved file is deleted, so a late timer can't re-create it.
 */
export function dropSession(sessionId: string): void {
  const entry = entries.get(sessionId)
  if (!entry) return
  if (entry.timer) clearTimeout(entry.timer)
  entry.unsub()
  entries.delete(sessionId)
}

/** Persist the latest snapshot of every tracked session immediately. */
export function flushAllSessions(): void {
  entries.forEach((entry, sessionId) => {
    const data = serializeSurface(sessionId)
    if (data !== null) void saveTerminalSession(entry.persistentId, data)
  })
}

/**
 * Persist every tracked session's latest snapshot and AWAIT all disk writes.
 *
 * Used on the quit path: the Rust side exits the process with `app_handle.exit(0)`
 * the instant `cmd_quit_app` returns, so the best-effort `beforeunload` /
 * `visibilitychange` backstop (which fires `saveTerminalSession` without
 * awaiting it) never runs to completion — the most recent output (e.g. a command
 * run moments before quitting) is lost. Awaiting the writes here guarantees the
 * snapshot is durable before the process dies, so it replays on the next launch.
 * Best-effort: `saveTerminalSession` swallows its own errors, so this never
 * rejects and never blocks the quit.
 */
export async function flushAllSessionsAsync(): Promise<void> {
  const saves: Promise<void>[] = []
  entries.forEach((entry, sessionId) => {
    if (entry.timer) {
      clearTimeout(entry.timer)
      entry.timer = null
    }
    const data = serializeSurface(sessionId)
    if (data !== null) saves.push(saveTerminalSession(entry.persistentId, data))
  })
  await Promise.all(saves)
}
