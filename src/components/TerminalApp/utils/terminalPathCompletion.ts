// Filesystem path completion for the standalone Terminal app's autocomplete.
//
// When the user is typing a path-like argument at the prompt, this module lists
// the real files/folders in the relevant directory (relative to the tab's cwd)
// so they can be merged into the autocomplete dropdown / ghost text alongside
// shell-history matches.
//
// The directory listing is fetched asynchronously (Tauri `cmd_terminal_list_dir`)
// and cached per session keyed by the resolved directory, so typing more of the
// final path fragment filters locally with no extra round-trips; only crossing a
// `/` into a different directory triggers a new fetch.

import { useTerminalAppStore } from '@/store/terminal-app-store'
import { collectTabs } from '@/store/terminal-app-store/treeUtils'

/** A directory entry returned by the backend listing. */
export interface PathEntry {
  name: string
  isDir: boolean
}

/** The path-shaped portion of the current input token. */
export interface ParsedToken {
  /** True when the current token looks like a filesystem path argument. */
  isPath: boolean
  /** Index in `input` where the current token starts. */
  tokenStart: number
  /** Directory portion of the token, incl. trailing slash (e.g. `src/`, `~/`). */
  dirPart: string
  /** Fragment after the last slash that we're completing (e.g. `comp`). */
  fragment: string
}

/** Commands whose arguments are typically paths — triggers completion even
 * before the user types a slash (e.g. `cd Desk`). */
const PATH_COMMANDS = new Set([
  'cd', 'ls', 'cat', 'vim', 'vi', 'nano', 'code', 'rm', 'cp', 'mv', 'mkdir',
  'rmdir', 'touch', 'less', 'more', 'head', 'tail', 'source', '.', 'bat',
  'open', 'subl', 'pushd', 'chmod', 'chown', 'du', 'stat', 'zip', 'unzip',
])

const NON_DOTFILE_CAP = 12

interface PathCache {
  /** Identity of the resolved directory the entries belong to. */
  dirKey: string
  entries: PathEntry[]
}

const cache = new Map<string, PathCache>()
const inflight = new Map<string, string>()
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

/** The tab's current working directory (from OSC 7 / cwd tracking), or null. */
function currentCwd(sessionId: string): string | null {
  const tab = collectTabs(useTerminalAppStore.getState().tree).find((t) => t.id === sessionId)
  return tab?.cwd ?? null
}

function dirKeyOf(cwd: string, dirPart: string): string {
  return `${cwd}\u0000${dirPart}`
}

/**
 * Parse the current input token and decide whether it looks like a path. The
 * token is the whitespace-delimited word ending at the caret; it's path-like if
 * it is shaped like a path (`/`, `./`, `../`, `~/`, or contains a slash) or its
 * command word is a known path-consuming command.
 */
export function parsePathToken(input: string, cursor: number): ParsedToken {
  const upto = input.slice(0, cursor)
  const tokenStart = upto.lastIndexOf(' ') + 1
  const token = upto.slice(tokenStart)

  const slash = token.lastIndexOf('/')
  const dirPart = slash >= 0 ? token.slice(0, slash + 1) : ''
  const fragment = slash >= 0 ? token.slice(slash + 1) : token

  const shaped =
    token.startsWith('/') ||
    token.startsWith('./') ||
    token.startsWith('../') ||
    token.startsWith('~/') ||
    token.includes('/')

  const before = input.slice(0, tokenStart).trim()
  const words = before.length ? before.split(/\s+/) : []
  const firstWord = words[0] ?? ''
  const prevWord = words[words.length - 1] ?? ''
  const cmdPath =
    words.length > 0 && (PATH_COMMANDS.has(firstWord) || PATH_COMMANDS.has(prevWord))

  return { isPath: shaped || cmdPath, tokenStart, dirPart, fragment }
}

/**
 * Synchronously read the cached directory listing for the current token,
 * filtered to the fragment. Returns `null` when the token isn't path-like, the
 * cwd is unknown, or the cache doesn't yet hold this directory (a listing is
 * fetched separately via `ensurePathListing`). Dotfiles are hidden unless the
 * fragment itself starts with a dot, mirroring shell completion.
 */
export function getPathEntries(
  sessionId: string,
  input: string,
  cursor: number,
): { parsed: ParsedToken; entries: PathEntry[] } | null {
  const parsed = parsePathToken(input, cursor)
  if (!parsed.isPath) return null
  const cwd = currentCwd(sessionId)
  if (cwd == null) return null
  const cached = cache.get(sessionId)
  if (!cached || cached.dirKey !== dirKeyOf(cwd, parsed.dirPart)) return null

  const frag = parsed.fragment
  const fragLower = frag.toLowerCase()
  const allowDot = frag.startsWith('.')
  const entries = cached.entries
    .filter((e) => (allowDot || !e.name.startsWith('.')) && e.name.toLowerCase().startsWith(fragLower))
    .slice(0, NON_DOTFILE_CAP)
  return { parsed, entries }
}

/**
 * Ensure the directory for the current token is listed (debounced). Fetches a
 * fresh listing only when the resolved directory changes; calls `onUpdate` after
 * a successful fetch so the engine can re-emit suggestions. Never throws.
 */
export function ensurePathListing(
  sessionId: string,
  input: string,
  cursor: number,
  onUpdate: () => void,
): void {
  const parsed = parsePathToken(input, cursor)
  if (!parsed.isPath) return
  const cwd = currentCwd(sessionId)
  if (cwd == null) return
  const key = dirKeyOf(cwd, parsed.dirPart)
  if (cache.get(sessionId)?.dirKey === key) return
  if (inflight.get(sessionId) === key) return

  const existing = debounceTimers.get(sessionId)
  if (existing) clearTimeout(existing)
  debounceTimers.set(
    sessionId,
    setTimeout(() => {
      inflight.set(sessionId, key)
      void (async () => {
        try {
          const res = await window.api?.terminalListDir(cwd, parsed.dirPart)
          if (res?.success && res.data) {
            cache.set(sessionId, { dirKey: key, entries: res.data })
            onUpdate()
          }
        } catch (err) {
          console.warn('[TerminalApp] list dir failed', err)
        } finally {
          if (inflight.get(sessionId) === key) inflight.delete(sessionId)
        }
      })()
    }, 100),
  )
}

/** Drop all path-completion state for a session (on tab close). */
export function dropPathCompletion(sessionId: string): void {
  cache.delete(sessionId)
  inflight.delete(sessionId)
  const t = debounceTimers.get(sessionId)
  if (t) clearTimeout(t)
  debounceTimers.delete(sessionId)
}
