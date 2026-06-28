import { getActiveAIContextProvider } from './aiContextRegistry'
import { useAIMemoryStore } from '@/store/ai-memory-store'

/** Max characters of user-scope memory injected into every prompt. */
const USER_MEMORY_MAX_CHARS = 8000

/**
 * Build the auto-attached context block that gets appended to every
 * AI request's system prompt — Genisys's analogue of an AI assistant's
 * `<environment_info>` / `<workspace_info>` injection.
 *
 * Sections currently emitted:
 *   - <environment_info>  always (OS, date, app)
 *   - <workspace_info>    only if the active surface has registered
 *                          an AIContextProvider via aiContextRegistry
 *   - <userMemory>        first ~8 KB of user-scope memory files
 *                          (auto-loaded so the model always sees
 *                          stable preferences and patterns)
 *   - <sessionMemory>     list of session-scope file paths
 *   - <repoMemory>        list of repo-scope file paths
 *
 * Future sections (placeholders for upcoming phases of the plan):
 *   - <availableDeferredTools>  Phase 5 — names of tools not active by default
 *
 * Output is wrapped in a clear delimiter so the model treats it as
 * read-only ambient context, not a user request.
 */
export function buildAutoContextBlock(): string {
  const sections: string[] = []
  sections.push(buildEnvironmentInfo())

  const provider = getActiveAIContextProvider()
  if (provider) {
    const snapshot = safeGetContext(provider)
    if (snapshot && snapshot.trim().length > 0) {
      sections.push(
        `<workspace_info surface="${escapeAttr(provider.id)}">\n${snapshot.trim()}\n</workspace_info>`,
      )
    }
  }

  sections.push(...buildMemorySections())

  const body = sections.join('\n\n')
  return `\n────────────────────────────────────────────────────────────
AUTO-ATTACHED CONTEXT (read-only, refreshed every turn)
────────────────────────────────────────────────────────────
${body}
`
}

function buildEnvironmentInfo(): string {
  const parts: string[] = ['app="Genisys"']
  try {
    if (typeof navigator !== 'undefined' && navigator.platform) {
      parts.push(`platform="${escapeAttr(navigator.platform)}"`)
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      parts.push(`locale="${escapeAttr(navigator.language)}"`)
    }
  } catch {
    // navigator may be unavailable in non-browser contexts; safe to ignore
  }
  const now = new Date()
  parts.push(`current_date="${now.toISOString().slice(0, 10)}"`)
  parts.push(`current_time="${now.toTimeString().slice(0, 8)}"`)
  return `<environment_info ${parts.join(' ')} />`
}

/**
 * Emit the three memory sections. User-scope content is injected
 * inline (capped at USER_MEMORY_MAX_CHARS); session- and repo-scope
 * are listed by path only — the model can request bodies via the
 * `memory_view` tool when needed. This mirrors a common AI-assistant
 * /memories/ load behaviour: user memory is "free" context, the
 * other scopes are discoverable on demand.
 */
function buildMemorySections(): string[] {
  let store
  try {
    store = useAIMemoryStore.getState()
  } catch {
    return []
  }
  const sections: string[] = []

  // ── user memory: full content (capped) ─────────────────────────
  const userPaths = store.list('user')
  if (userPaths.length === 0) {
    sections.push('<userMemory empty="true" />')
  } else {
    let body = ''
    let truncated = false
    for (const path of userPaths) {
      const file = store.read('user', path)
      if (!file) continue
      const segment = `## ${path}\n${file.content}\n\n`
      if (body.length + segment.length > USER_MEMORY_MAX_CHARS) {
        truncated = true
        break
      }
      body += segment
    }
    const note = truncated
      ? `\n\n[truncated — ${userPaths.length} total files; use memory_view to see the rest]`
      : ''
    sections.push(`<userMemory file_count="${userPaths.length}">\n${body.trimEnd()}${note}\n</userMemory>`)
  }

  // ── session + repo: list paths only ────────────────────────────
  const sessionPaths = store.list('session')
  sections.push(buildPathListSection('sessionMemory', sessionPaths))
  const repoPaths = store.list('repo')
  sections.push(buildPathListSection('repoMemory', repoPaths))

  return sections
}

function buildPathListSection(tag: string, paths: string[]): string {
  if (paths.length === 0) return `<${tag} empty="true" />`
  const list = paths.map((p) => `- ${p}`).join('\n')
  return `<${tag} file_count="${paths.length}">\n${list}\n</${tag}>`
}

function safeGetContext(provider: { getContext: () => string | null }): string | null {
  try {
    return provider.getContext()
  } catch {
    // A misbehaving provider must never break the LLM call — drop its
    // section silently and let the request proceed without it.
    return null
  }
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
