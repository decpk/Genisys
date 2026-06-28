// Shadow line buffer for the standalone Terminal app's history autocomplete.
//
// The frontend never owns the prompt line — the real shell PTY does. To know
// what the user has typed (so we can match it against history), we maintain a
// best-effort "shadow" copy of the current input by interpreting the same byte
// stream xterm emits to the PTY via `term.onData`.
//
// This is a heuristic mini line-editor. Any input we can't confidently model
// (Tab completion, ↑/↓ history recall, an unrecognised escape) flips the line
// to `unknown`, which suppresses suggestions until the line is reset (Enter /
// Ctrl+C / Ctrl+U). Failing safe avoids showing a ghost based on a desynced
// buffer. Tracking is also gated on the terminal being on its normal screen
// (not an alt-screen TUI like vim).

import type { IBuffer, Terminal as XTerm } from '@xterm/xterm'

import { useSettingsStore } from '@/store/settings-store'
import { useTerminalHistoryStore } from '@/store/terminal-history-store'

/** Current best-effort state of one session's prompt input. */
export interface TerminalLineState {
  /** The characters the user has typed at the current prompt. */
  input: string
  /** Caret position within `input` (0..input.length). */
  cursor: number
  /** True when the shadow buffer may be desynced — suppress suggestions. */
  unknown: boolean
}

type Listener = (state: TerminalLineState) => void

const states = new Map<string, TerminalLineState>()
const listeners = new Map<string, Set<Listener>>()
/** Buffer position (absolute row, col) where the current prompt's input begins,
 * captured while the line is empty. Used to rebuild the shadow line from the
 * screen after a desync. */
const anchors = new Map<string, { row: number; col: number }>()

const EMPTY: TerminalLineState = { input: '', cursor: 0, unknown: false }

function getState(sessionId: string): TerminalLineState {
  return states.get(sessionId) ?? EMPTY
}

function setState(sessionId: string, next: TerminalLineState): void {
  states.set(sessionId, next)
  const subs = listeners.get(sessionId)
  if (subs) for (const cb of subs) cb(next)
}

/** Read the current shadow line for a session. */
export function getTerminalLine(sessionId: string): TerminalLineState {
  return getState(sessionId)
}

/** Subscribe to shadow-line changes for a session. Returns an unsubscribe fn. */
export function subscribeTerminalLine(sessionId: string, cb: Listener): () => void {
  let subs = listeners.get(sessionId)
  if (!subs) {
    subs = new Set()
    listeners.set(sessionId, subs)
  }
  subs.add(cb)
  return () => {
    subs?.delete(cb)
  }
}

/** Overwrite the shadow line (used after injecting accepted text, which bypasses
 * `onData`, so the tracker must be re-synced manually). */
export function setTerminalLine(sessionId: string, input: string, cursor?: number): void {
  setState(sessionId, {
    input,
    cursor: cursor ?? input.length,
    unknown: false,
  })
}

/** Reset the shadow line to empty (e.g. on a fresh prompt). */
export function resetTerminalLine(sessionId: string): void {
  setState(sessionId, { input: '', cursor: 0, unknown: false })
}

/** Drop all state for a session (on tab close). */
export function dropTerminalLine(sessionId: string): void {
  states.delete(sessionId)
  listeners.delete(sessionId)
  anchors.delete(sessionId)
}

// Control bytes xterm sends for the keys we model.
const ENTER = /[\r\n]/
const BACKSPACE = '\x7f'
const BACKSPACE_ALT = '\x08'
const CTRL_C = '\x03'
const CTRL_U = '\x15'
const CTRL_W = '\x17'
const CTRL_A = '\x01'
const CTRL_E = '\x05'
const CTRL_K = '\x0b'
const TAB = '\t'
const PASTE_START = '\x1b[200~'
const PASTE_END = '\x1b[201~'

/** Delete the word (and trailing run of spaces) before the caret. */
function deleteWordBefore(state: TerminalLineState): TerminalLineState {
  let i = state.cursor
  while (i > 0 && state.input[i - 1] === ' ') i--
  while (i > 0 && state.input[i - 1] !== ' ') i--
  const input = state.input.slice(0, i) + state.input.slice(state.cursor)
  return { input, cursor: i, unknown: false }
}

/** Index one word to the left of `cursor`. */
function wordLeft(input: string, cursor: number): number {
  let i = cursor
  while (i > 0 && input[i - 1] === ' ') i--
  while (i > 0 && input[i - 1] !== ' ') i--
  return i
}

/** Index one word to the right of `cursor`. */
function wordRight(input: string, cursor: number): number {
  let i = cursor
  while (i < input.length && input[i] === ' ') i++
  while (i < input.length && input[i] !== ' ') i++
  return i
}

/** Delete the word after the caret. */
function deleteWordAfter(state: TerminalLineState): TerminalLineState {
  const end = wordRight(state.input, state.cursor)
  return {
    input: state.input.slice(0, state.cursor) + state.input.slice(end),
    cursor: state.cursor,
    unknown: false,
  }
}

/**
 * Rebuild the shadow input from the on-screen buffer after a desync (shell
 * history recall via ↑/↓, an unmodelled edit, etc.). Reads the prompt row from
 * the captured anchor up to the caret — skipping wide-char spacer cells and
 * excluding any shell autosuggestion (which sits after the caret). Returns null
 * (stay desynced) when the input wrapped to another row or the anchor looks
 * stale, which is safer than guessing.
 */
function reconstructFromBuffer(
  buf: IBuffer,
  anchor: { row: number; col: number } | undefined,
): TerminalLineState | null {
  if (!anchor) return null
  const cursorRow = buf.baseY + buf.cursorY
  if (cursorRow !== anchor.row || buf.cursorX < anchor.col) return null
  const line = buf.getLine(anchor.row)
  if (!line) return null
  let text = ''
  for (let x = anchor.col; x < buf.cursorX; x++) {
    const cell = line.getCell(x)
    if (!cell || cell.getWidth() === 0) continue
    const chars = cell.getChars()
    text += chars.length > 0 ? chars : ' '
  }
  return { input: text, cursor: text.length, unknown: false }
}

/** Insert literal text at the caret. */
function insertText(state: TerminalLineState, text: string): TerminalLineState {
  const input = state.input.slice(0, state.cursor) + text + state.input.slice(state.cursor)
  return { input, cursor: state.cursor + text.length, unknown: false }
}

/**
 * Feed a chunk emitted by `term.onData` into the session's shadow line.
 *
 * `term` is used only to gate on the normal screen buffer (so TUIs don't get a
 * bogus shadow line). On submit (Enter) the completed command is recorded into
 * the history store so it suggests immediately for the rest of the session.
 */
export function feedTerminalLine(sessionId: string, data: string, term: XTerm): void {
  // Feature gate: when autocomplete is off, don't maintain a shadow line.
  if (!useSettingsStore.getState().terminalHistoryAutocomplete) {
    const s = getState(sessionId)
    if (s.input || s.unknown) resetTerminalLine(sessionId)
    return
  }
  // Don't track while an alt-screen app (vim, less, a TUI) owns the screen.
  if (term.buffer.active.type !== 'normal') {
    if (getState(sessionId).input || getState(sessionId).unknown) resetTerminalLine(sessionId)
    return
  }

  const buf = term.buffer.active
  let state = getState(sessionId)

  // While the line is empty the caret sits just after the prompt — remember
  // that position so we can rebuild the input from the screen after a desync.
  if (state.input === '' && !state.unknown) {
    anchors.set(sessionId, { row: buf.baseY + buf.cursorY, col: buf.cursorX })
  }

  // Self-heal: if we'd lost track of the line (history recall, an unmodelled
  // edit, etc.), rebuild it from the on-screen buffer so suggestions resume
  // without the user having to reset the prompt (Ctrl+C / Enter).
  if (state.unknown) {
    const rebuilt = reconstructFromBuffer(buf, anchors.get(sessionId))
    if (rebuilt) state = rebuilt
  }

  // Bracketed paste: unwrap and insert the inner text (single-line only).
  if (data.startsWith(PASTE_START)) {
    const inner = data.slice(PASTE_START.length, data.endsWith(PASTE_END) ? -PASTE_END.length : undefined)
    if (inner.includes('\n') || inner.includes('\r')) {
      setState(sessionId, { input: '', cursor: 0, unknown: true })
    } else {
      setState(sessionId, insertText(state, inner))
    }
    return
  }

  // Walk the chunk so multi-byte sequences (arrows) and runs of text both work.
  let i = 0
  while (i < data.length) {
    const ch = data[i]

    // Submit: record the command and reset for the next prompt.
    if (ENTER.test(ch)) {
      if (!state.unknown && state.input.trim()) {
        useTerminalHistoryStore.getState().recordCommand(state.input)
      }
      state = { input: '', cursor: 0, unknown: false }
      i++
      continue
    }

    // Escape sequences — only cursor moves are modelled; the rest desync us.
    if (ch === '\x1b') {
      const rest = data.slice(i)
      if (rest.startsWith('\x1b[D')) {
        state = { ...state, cursor: Math.max(0, state.cursor - 1) }
        i += 3
      } else if (rest.startsWith('\x1b[C')) {
        state = { ...state, cursor: Math.min(state.input.length, state.cursor + 1) }
        i += 3
      } else if (rest.startsWith('\x1b[H') || rest.startsWith('\x1bOH') || rest.startsWith('\x1b[1~')) {
        state = { ...state, cursor: 0 }
        i += rest.startsWith('\x1b[1~') ? 4 : 3
      } else if (rest.startsWith('\x1b[F') || rest.startsWith('\x1bOF') || rest.startsWith('\x1b[4~')) {
        state = { ...state, cursor: state.input.length }
        i += rest.startsWith('\x1b[4~') ? 4 : 3
      } else if (rest.startsWith('\x1b[3~')) {
        // Forward delete (Delete / fn+Backspace): remove the char at the caret.
        state = {
          input: state.input.slice(0, state.cursor) + state.input.slice(state.cursor + 1),
          cursor: state.cursor,
          unknown: false,
        }
        i += 4
      } else if (rest.startsWith('\x1b\x7f')) {
        // Meta / Option+Backspace: delete the word before the caret.
        state = deleteWordBefore(state)
        i += 2
      } else if (rest.startsWith('\x1bd')) {
        // Meta+d: delete the word after the caret.
        state = deleteWordAfter(state)
        i += 2
      } else if (rest.startsWith('\x1bb')) {
        // Meta+b / Option+Left: move one word left.
        state = { ...state, cursor: wordLeft(state.input, state.cursor) }
        i += 2
      } else if (rest.startsWith('\x1bf')) {
        // Meta+f / Option+Right: move one word right.
        state = { ...state, cursor: wordRight(state.input, state.cursor) }
        i += 2
      } else {
        // ↑/↓ history recall or any other escape — we can no longer trust the
        // line; the next keystroke rebuilds it from the screen (see above).
        state = { input: '', cursor: 0, unknown: true }
        break
      }
      continue
    }

    if (state.unknown) {
      // Stay desynced until an explicit reset key below.
      if (ch === CTRL_C || ch === CTRL_U) state = { input: '', cursor: 0, unknown: false }
      i++
      continue
    }

    if (ch === BACKSPACE || ch === BACKSPACE_ALT) {
      if (state.cursor > 0) {
        const input = state.input.slice(0, state.cursor - 1) + state.input.slice(state.cursor)
        state = { input, cursor: state.cursor - 1, unknown: false }
      }
      i++
    } else if (ch === CTRL_C || ch === CTRL_U) {
      state = { input: '', cursor: 0, unknown: false }
      i++
    } else if (ch === CTRL_W) {
      state = deleteWordBefore(state)
      i++
    } else if (ch === CTRL_A) {
      state = { ...state, cursor: 0 }
      i++
    } else if (ch === CTRL_E) {
      state = { ...state, cursor: state.input.length }
      i++
    } else if (ch === CTRL_K) {
      state = { ...state, input: state.input.slice(0, state.cursor) }
      i++
    } else if (ch === TAB) {
      // Shell completion rewrites the line — we can't predict it.
      state = { input: '', cursor: 0, unknown: true }
      break
    } else if (ch >= ' ') {
      // Printable: accumulate a run of printable chars for efficiency.
      let j = i
      while (j < data.length && data[j] >= ' ' && data[j] !== '\x7f' && data[j] !== '\x1b') j++
      state = insertText(state, data.slice(i, j))
      i = j
    } else {
      // Unmodelled control byte → fail safe.
      state = { input: '', cursor: 0, unknown: true }
      break
    }
  }

  setState(sessionId, state)
}
