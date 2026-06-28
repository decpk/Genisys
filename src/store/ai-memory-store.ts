import { create } from 'zustand'

/**
 * AI Memory Store
 * ───────────────
 *
 * Three-scoped persistent notes layer for the Genisys AI Assistant —
 * the equivalent of an AI assistant's `/memories/` filesystem.
 *
 *   - `user`    Survives across sessions and workspaces. Auto-injected
 *               (first ~200 lines) into every system prompt as
 *               `<userMemory>`. Use for stable preferences and patterns.
 *   - `session` In-memory only. Cleared when the page reloads. Use for
 *               working state within one chat session.
 *   - `repo`    Survives across sessions, scoped to the local Genisys
 *               install (single-workspace today, but future-proof).
 *               Use for codebase facts, build commands, conventions.
 *
 * Persistence: `user` and `repo` are mirrored to localStorage. The
 * Tauri webview keeps localStorage across app restarts. We deliberately
 * avoid a Rust/SQLite round-trip in this v1 — swap the persist helpers
 * for a `window.api.*` backend later without touching the store API.
 */

export type AIMemoryScope = 'user' | 'session' | 'repo'

export interface AIMemoryFile {
  /** Slash-delimited path within the scope, e.g. "preferences/style.md". */
  path: string
  content: string
  /** ISO timestamp of last write. */
  updatedAt: string
}

interface AIMemoryState {
  files: Record<AIMemoryScope, Record<string, AIMemoryFile>>
}

interface AIMemoryActions {
  /** Read a single file. Returns null if missing. */
  read: (scope: AIMemoryScope, path: string) => AIMemoryFile | null
  /** List files (paths only) within a scope, sorted. */
  list: (scope: AIMemoryScope) => string[]
  /** Create a new file. Fails if the path already exists. */
  create: (scope: AIMemoryScope, path: string, content: string) => { ok: boolean; error?: string }
  /** Replace the FIRST occurrence of `oldStr` with `newStr`. */
  strReplace: (
    scope: AIMemoryScope,
    path: string,
    oldStr: string,
    newStr: string,
  ) => { ok: boolean; error?: string }
  /** Insert text after the given 0-based line. Use 0 to prepend. */
  insert: (
    scope: AIMemoryScope,
    path: string,
    line: number,
    text: string,
  ) => { ok: boolean; error?: string }
  /** Delete a file. */
  remove: (scope: AIMemoryScope, path: string) => { ok: boolean; error?: string }
  /** Rename / move a file within the same scope. */
  rename: (scope: AIMemoryScope, fromPath: string, toPath: string) => { ok: boolean; error?: string }
}

// ── Persistence helpers ───────────────────────────────────────────────

const LS_USER_KEY = 'genisys.ai-memory.user'
const LS_REPO_KEY = 'genisys.ai-memory.repo'

function loadFromLocalStorage(key: string): Record<string, AIMemoryFile> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    // Defensive: ignore non-object payloads from older versions / corruption.
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, AIMemoryFile>
  } catch {
    return {}
  }
}

function persistScope(scope: AIMemoryScope, files: Record<string, AIMemoryFile>): void {
  if (typeof localStorage === 'undefined') return
  if (scope === 'session') return // session never persists
  const key = scope === 'user' ? LS_USER_KEY : LS_REPO_KEY
  try {
    localStorage.setItem(key, JSON.stringify(files))
  } catch {
    // Storage full / unavailable — silently drop. The model can retry on next write.
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

// ── Store ─────────────────────────────────────────────────────────────

export const useAIMemoryStore = create<AIMemoryState & AIMemoryActions>()((set, get) => ({
  files: {
    user: loadFromLocalStorage(LS_USER_KEY),
    session: {},
    repo: loadFromLocalStorage(LS_REPO_KEY),
  },

  read: (scope, path) => get().files[scope][path] ?? null,

  list: (scope) => Object.keys(get().files[scope]).sort(),

  create: (scope, path, content) => {
    if (!path || path.includes('..')) return { ok: false, error: 'Invalid path.' }
    const existing = get().files[scope][path]
    if (existing) return { ok: false, error: `Memory file "${path}" already exists.` }
    set((s) => {
      const next = { ...s.files[scope], [path]: { path, content, updatedAt: nowIso() } }
      persistScope(scope, next)
      return { files: { ...s.files, [scope]: next } }
    })
    return { ok: true }
  },

  strReplace: (scope, path, oldStr, newStr) => {
    const file = get().files[scope][path]
    if (!file) return { ok: false, error: `Memory file "${path}" does not exist.` }
    const idx = file.content.indexOf(oldStr)
    if (idx === -1) return { ok: false, error: `String not found in "${path}".` }
    if (file.content.indexOf(oldStr, idx + 1) !== -1) {
      return { ok: false, error: `String appears multiple times in "${path}" — provide a more specific old_str.` }
    }
    const updated = { ...file, content: file.content.replace(oldStr, newStr), updatedAt: nowIso() }
    set((s) => {
      const next = { ...s.files[scope], [path]: updated }
      persistScope(scope, next)
      return { files: { ...s.files, [scope]: next } }
    })
    return { ok: true }
  },

  insert: (scope, path, line, text) => {
    const file = get().files[scope][path]
    if (!file) return { ok: false, error: `Memory file "${path}" does not exist.` }
    if (line < 0) return { ok: false, error: 'line must be >= 0.' }
    const lines = file.content.split('\n')
    if (line > lines.length) return { ok: false, error: `line ${line} exceeds file length (${lines.length}).` }
    lines.splice(line, 0, text)
    const updated = { ...file, content: lines.join('\n'), updatedAt: nowIso() }
    set((s) => {
      const next = { ...s.files[scope], [path]: updated }
      persistScope(scope, next)
      return { files: { ...s.files, [scope]: next } }
    })
    return { ok: true }
  },

  remove: (scope, path) => {
    const file = get().files[scope][path]
    if (!file) return { ok: false, error: `Memory file "${path}" does not exist.` }
    set((s) => {
      const next = { ...s.files[scope] }
      delete next[path]
      persistScope(scope, next)
      return { files: { ...s.files, [scope]: next } }
    })
    return { ok: true }
  },

  rename: (scope, fromPath, toPath) => {
    if (!toPath || toPath.includes('..')) return { ok: false, error: 'Invalid destination path.' }
    const file = get().files[scope][fromPath]
    if (!file) return { ok: false, error: `Memory file "${fromPath}" does not exist.` }
    if (get().files[scope][toPath]) return { ok: false, error: `Destination "${toPath}" already exists.` }
    set((s) => {
      const next = { ...s.files[scope] }
      delete next[fromPath]
      next[toPath] = { ...file, path: toPath, updatedAt: nowIso() }
      persistScope(scope, next)
      return { files: { ...s.files, [scope]: next } }
    })
    return { ok: true }
  },
}))
