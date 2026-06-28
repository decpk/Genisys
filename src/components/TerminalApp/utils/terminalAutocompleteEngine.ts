// Suggestion engine for the standalone Terminal app's history autocomplete.
//
// Bridges the shadow line tracker (what the user typed) and the history store
// (past commands) into per-session suggestion state — a ghost-text suffix plus
// a ranked dropdown list — consumed by both the overlay UI (React, via
// `subscribeSuggestion`) and the xterm key handler (imperative, via
// `getSuggestion`). Accepting a suggestion injects the completion into the PTY
// and re-syncs the tracker (the injected write bypasses `onData`).

import { terminalWrite } from '@/components/Terminal/api/terminalWrite'
import { encodeBase64 } from '@/components/Terminal/utils/encodeBase64'
import { useSettingsStore } from '@/store/settings-store'
import {
  ghostFor,
  matchesFor,
  useTerminalHistoryStore,
} from '@/store/terminal-history-store'

import {
  getTerminalLine,
  setTerminalLine,
  subscribeTerminalLine,
} from './terminalLineTracker'
import {
  dropPathCompletion,
  ensurePathListing,
  getPathEntries,
} from './terminalPathCompletion'

/** One dropdown candidate. `value` is the full command line applied on accept;
 * `label` is what's shown. History items replace the whole line; path items
 * complete the current token (so their `value` is line-prefix + completed path). */
export interface SuggestionItem {
  kind: 'history' | 'path'
  value: string
  label: string
  isDir?: boolean
}

/** Derived suggestion state for one session. */
export interface SuggestionState {
  /** The input the suggestions were derived from. */
  input: string
  /** Ghost suffix to render after the caret (empty = none). */
  ghost: string
  /** Full command/line the ghost completes to (empty = none). */
  ghostCommand: string
  /** Dropdown candidates (history commands + filesystem paths), best first. */
  items: SuggestionItem[]
  /** Whether the dropdown is open. */
  open: boolean
  /** Highlighted index within `items`. */
  index: number
}

const MAX_MATCHES = 8

/** UI flags that aren't derived from the input (dropdown open / selection). */
interface Meta {
  open: boolean
  index: number
}

const meta = new Map<string, Meta>()
const subscribers = new Map<string, Set<(s: SuggestionState) => void>>()
const trackerUnsub = new Map<string, () => void>()

function getMeta(sessionId: string): Meta {
  let m = meta.get(sessionId)
  if (!m) {
    m = { open: false, index: 0 }
    meta.set(sessionId, m)
  }
  return m
}

/** Compute fresh suggestion state from the current line + history + filesystem. */
export function getSuggestion(sessionId: string): SuggestionState {
  if (!useSettingsStore.getState().terminalHistoryAutocomplete) {
    return { input: '', ghost: '', ghostCommand: '', items: [], open: false, index: 0 }
  }
  const line = getTerminalLine(sessionId)
  const enabled = !line.unknown && line.input.length > 0
  const atEol = line.cursor === line.input.length
  if (!enabled) {
    return { input: line.input, ghost: '', ghostCommand: '', items: [], open: false, index: 0 }
  }

  const entries = useTerminalHistoryStore.getState().entries

  // Filesystem candidates — only when the token looks like a path and the caret
  // is at end of line (so completing the trailing token is unambiguous).
  const pathItems: SuggestionItem[] = []
  if (atEol) {
    const pe = getPathEntries(sessionId, line.input, line.cursor)
    if (pe) {
      const prefix = line.input.slice(0, pe.parsed.tokenStart)
      for (const e of pe.entries) {
        const completed = pe.parsed.dirPart + e.name + (e.isDir ? '/' : '')
        pathItems.push({
          kind: 'path',
          value: prefix + completed,
          label: e.name + (e.isDir ? '/' : ''),
          isDir: e.isDir,
        })
      }
    }
  }

  // History command candidates.
  const historyItems: SuggestionItem[] = matchesFor(entries, line.input, MAX_MATCHES).map(
    (mm) => ({ kind: 'history', value: mm.command, label: mm.command }),
  )

  // Merge: path entries first (active navigation), then history; dedupe by value.
  const seen = new Set<string>()
  const items: SuggestionItem[] = []
  for (const it of [...pathItems, ...historyItems]) {
    if (it.value === line.input || seen.has(it.value)) continue
    seen.add(it.value)
    items.push(it)
    if (items.length >= MAX_MATCHES) break
  }

  // Ghost: prefer a clean path prefix-completion, else the history ghost.
  let ghostCommand = ''
  if (atEol) {
    const ghostPath = pathItems.find((p) => p.value.startsWith(line.input))
    if (ghostPath) ghostCommand = ghostPath.value
    else ghostCommand = ghostFor(entries, line.input) ?? ''
  }
  const ghost = ghostCommand ? ghostCommand.slice(line.input.length) : ''

  const m = getMeta(sessionId)
  const open = m.open && items.length > 0
  const index = items.length ? Math.min(Math.max(m.index, 0), items.length - 1) : 0

  return { input: line.input, ghost, ghostCommand, items, open, index }
}

function emit(sessionId: string): void {
  const subs = subscribers.get(sessionId)
  if (!subs || subs.size === 0) return
  const state = getSuggestion(sessionId)
  for (const cb of subs) cb(state)
}

/** Tracker change handler: keep the dropdown coherent as the input changes. */
function onLineChange(sessionId: string): void {
  const m = getMeta(sessionId)
  // Re-ranking on each keystroke makes the old selection meaningless.
  m.index = 0
  if (useSettingsStore.getState().terminalHistoryAutocomplete) {
    const line = getTerminalLine(sessionId)
    // Kick off (debounced) directory listing; re-emit when it lands.
    ensurePathListing(sessionId, line.input, line.cursor, () => emit(sessionId))
  }
  emit(sessionId)
}

/**
 * Subscribe to suggestion-state changes for a session (overlay UI). Sets up the
 * underlying tracker subscription on first subscriber and tears it down when the
 * last one leaves. Invokes `cb` immediately with the current state.
 */
export function subscribeSuggestion(
  sessionId: string,
  cb: (s: SuggestionState) => void,
): () => void {
  let subs = subscribers.get(sessionId)
  if (!subs) {
    subs = new Set()
    subscribers.set(sessionId, subs)
  }
  subs.add(cb)
  if (!trackerUnsub.has(sessionId)) {
    trackerUnsub.set(
      sessionId,
      subscribeTerminalLine(sessionId, () => onLineChange(sessionId)),
    )
  }
  cb(getSuggestion(sessionId))
  return () => {
    subs?.delete(cb)
    if (subs && subs.size === 0) {
      trackerUnsub.get(sessionId)?.()
      trackerUnsub.delete(sessionId)
      subscribers.delete(sessionId)
    }
  }
}

/** Open the dropdown (no-op when there are no matches). */
export function openDropdown(sessionId: string): void {
  if (getSuggestion(sessionId).items.length === 0) return
  const m = getMeta(sessionId)
  m.open = true
  m.index = 0
  emit(sessionId)
}

/** Close the dropdown. */
export function closeDropdown(sessionId: string): void {
  const m = getMeta(sessionId)
  if (!m.open) return
  m.open = false
  emit(sessionId)
}

/** Move the dropdown selection by `delta`, wrapping. Opens it if closed. */
export function moveSelection(sessionId: string, delta: number): void {
  const items = getSuggestion(sessionId).items
  if (items.length === 0) return
  const m = getMeta(sessionId)
  const base = m.open ? m.index : 0
  m.index = (base + delta + items.length) % items.length
  m.open = true
  emit(sessionId)
}

/** Set the highlighted dropdown index directly (e.g. on hover). */
export function setSelection(sessionId: string, index: number): void {
  const m = getMeta(sessionId)
  if (m.index === index) return
  m.index = index
  emit(sessionId)
}

/**
 * Inject `command` so the prompt shows it as typed input (does NOT run it — the
 * user reviews then presses Enter, matching zsh-autosuggestions). When the
 * typed input is a prefix of `command` we inject only the missing suffix;
 * otherwise we clear the line (Ctrl+E, Ctrl+U) and type the whole command. The
 * tracker is re-synced because the injected write bypasses `onData`.
 */
export function acceptCommand(sessionId: string, command: string): void {
  if (!command) return
  const input = getTerminalLine(sessionId).input
  const payload = command.startsWith(input)
    ? command.slice(input.length)
    : `\x05\x15${command}`
  void terminalWrite(sessionId, encodeBase64(payload)).catch(() => undefined)
  closeDropdown(sessionId)
  setTerminalLine(sessionId, command) // emits via tracker → recompute
}

/** Accept the current ghost suggestion, if any. Returns true when it acted. */
export function acceptGhost(sessionId: string): boolean {
  const { ghostCommand } = getSuggestion(sessionId)
  if (!ghostCommand) return false
  acceptCommand(sessionId, ghostCommand)
  return true
}

/** Accept the highlighted dropdown match, if the dropdown is open. */
export function acceptSelected(sessionId: string): boolean {
  const s = getSuggestion(sessionId)
  if (!s.open || s.items.length === 0) return false
  acceptCommand(sessionId, s.items[s.index].value)
  return true
}

/** Drop all engine state for a session (on tab close). */
export function dropSuggestion(sessionId: string): void {
  trackerUnsub.get(sessionId)?.()
  trackerUnsub.delete(sessionId)
  subscribers.delete(sessionId)
  meta.delete(sessionId)
  dropPathCompletion(sessionId)
}
