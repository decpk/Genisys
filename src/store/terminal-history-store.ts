import { create } from 'zustand'

/** A single past command with its frequency across the shell history file. */
export interface TerminalHistoryEntry {
  command: string
  count: number
}

interface TerminalHistoryState {
  /** Unique past commands, ordered most-recent-first. */
  entries: TerminalHistoryEntry[]
  /** True once a load has completed at least once. */
  loaded: boolean
  /** True while a load is in flight (dedupes concurrent callers). */
  loading: boolean
  /**
   * Load (or reload) the shell history from disk via the Tauri bridge. No-ops
   * if already loaded unless `force` is set. Never throws.
   */
  load: (force?: boolean) => Promise<void>
  /**
   * Fold a command the user just ran into the in-memory list so it ranks at the
   * top immediately — the shell history *file* is only written on shell exit,
   * so without this, commands from the current session wouldn't suggest until
   * relaunch. The file remains the source of truth at load time.
   */
  recordCommand: (command: string) => void
}

/** Upper bound on in-memory entries (prevents unbounded growth in-session). */
const MAX_ENTRIES = 10000

/**
 * Command history for the standalone Terminal app's autocomplete. Loaded once
 * from the user's shell history file (`~/.zsh_history` etc.) via
 * `cmd_terminal_history_read`, then kept fresh in-session via `recordCommand`.
 *
 * Matching helpers (`ghostFor` / `matchesFor`) are exported as pure functions so
 * the suggestion engine and the key handler can call them synchronously off
 * `getState().entries` without subscribing (avoids zustand selector churn).
 */
export const useTerminalHistoryStore = create<TerminalHistoryState>((set, get) => ({
  entries: [],
  loaded: false,
  loading: false,
  load: async (force = false) => {
    const { loaded, loading } = get()
    if (loading || (loaded && !force)) return
    set({ loading: true })
    try {
      const res = await window.api?.terminalHistoryRead()
      const raw = res?.success ? (res.data ?? []) : []
      // Drop multi-line entries — they can't be cleanly shown as ghost text or
      // injected as a single typed line.
      const data = raw.filter((e) => !e.command.includes('\n'))
      set({ entries: data, loaded: true, loading: false })
    } catch (err) {
      console.warn('[TerminalApp] read command history failed', err)
      set({ loaded: true, loading: false })
    }
  },
  recordCommand: (command) => {
    const cmd = command.trim()
    if (!cmd) return
    set((state) => {
      const prev = state.entries
      const existing = prev.find((e) => e.command === cmd)
      const count = (existing?.count ?? 0) + 1
      const rest = existing ? prev.filter((e) => e.command !== cmd) : prev
      const next = [{ command: cmd, count }, ...rest]
      if (next.length > MAX_ENTRIES) next.length = MAX_ENTRIES
      return { entries: next }
    })
  },
}))

/**
 * The single best ghost-text suggestion for `input`: the most-recent history
 * entry that has `input` as a (case-sensitive) prefix and is strictly longer.
 * Returns the FULL command (caller derives the suffix). Mirrors
 * zsh-autosuggestions' recency-based prefix match. `null` when no match.
 */
export function ghostFor(
  entries: TerminalHistoryEntry[],
  input: string,
): string | null {
  if (!input) return null
  for (const entry of entries) {
    if (entry.command.length > input.length && entry.command.startsWith(input)) {
      return entry.command
    }
  }
  return null
}

/**
 * Ranked dropdown matches for `input`: prefix matches first (by frequency, then
 * recency), then substring matches. Excludes an exact-equal command. Returns up
 * to `limit` entries.
 */
export function matchesFor(
  entries: TerminalHistoryEntry[],
  input: string,
  limit = 8,
): TerminalHistoryEntry[] {
  if (!input) return []
  const prefix: TerminalHistoryEntry[] = []
  const substring: TerminalHistoryEntry[] = []
  for (const entry of entries) {
    if (entry.command === input) continue
    if (entry.command.startsWith(input)) prefix.push(entry)
    else if (entry.command.includes(input)) substring.push(entry)
  }
  // Stable sort by frequency desc; equal counts keep recency order (input was
  // already most-recent-first), so ties favour the more recently used command.
  const byFreq = (a: TerminalHistoryEntry, b: TerminalHistoryEntry) => b.count - a.count
  prefix.sort(byFreq)
  substring.sort(byFreq)
  return [...prefix, ...substring].slice(0, limit)
}
