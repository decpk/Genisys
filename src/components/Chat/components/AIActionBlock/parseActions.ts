import type { AIActionDirective, AIActionId } from './AIActionBlock.types'

const AI_ACTIONS_FENCE_RE = /```ai-actions\s*\n([\s\S]*?)```/g
const AI_ACTIONS_OPEN_RE = /```ai-actions\b/i

const VALID_HIDE_IDS = new Set<AIActionId>(['implement', 'refine', 'cancel'])

/** Cheap pre-check: true if the message has any `ai-actions` fence at all. */
export function hasAIActions(content: string): boolean {
  return AI_ACTIONS_OPEN_RE.test(content)
}

function coerceDirective(raw: unknown): AIActionDirective | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (obj.ready !== true) return null

  const out: AIActionDirective = { ready: true }

  if (typeof obj.implementPrompt === 'string' && obj.implementPrompt.trim()) {
    out.implementPrompt = obj.implementPrompt.trim()
  }
  if (typeof obj.refinePrompt === 'string' && obj.refinePrompt.trim()) {
    out.refinePrompt = obj.refinePrompt.trim()
  }
  if (Array.isArray(obj.hide)) {
    const hide = obj.hide.filter(
      (id): id is AIActionId =>
        typeof id === 'string' && VALID_HIDE_IDS.has(id as AIActionId),
    )
    if (hide.length > 0) out.hide = hide
  }

  return out
}

export interface ParsedAIActions {
  /** Directive object when a well-formed fence was found, else null. */
  directive: AIActionDirective | null
  /**
   * Original content with the `ai-actions` fence and any
   * `<!-- ai-actions-ready -->` markers stripped — safe to feed into a
   * markdown renderer.
   */
  markdown: string
}

/**
 * Parse a (fully streamed) assistant message and extract the first
 * well-formed `ai-actions` directive plus the markdown with the fence
 * removed. If no fence is found, returns `{ directive: null, markdown: content }`.
 */
export function parseAIActions(content: string): ParsedAIActions {
  AI_ACTIONS_FENCE_RE.lastIndex = 0

  let directive: AIActionDirective | null = null
  const stripped = content.replace(AI_ACTIONS_FENCE_RE, (_match, body: string) => {
    if (directive) return '' // only the first valid fence wins
    try {
      const parsed = JSON.parse(body.trim())
      directive = coerceDirective(parsed)
    } catch {
      // Malformed JSON — fall through. We still strip the fence so the
      // user doesn't see raw JSON in the rendered message.
    }
    return ''
  })

  const markdown = stripped
    .replace(/<!--\s*ai-actions-ready\s*-->/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { directive, markdown }
}

export interface PartialAIActionsResult {
  /** True once we've seen an opening fence in the in-flight stream. */
  hasFence: boolean
  /** Content up to (but not including) the opening fence. */
  intro: string
}

/**
 * Streaming-time helper. While the AI is still emitting tokens, we don't
 * want users to see the raw `ai-actions` JSON. This returns the intro
 * portion so the caller can render only that until the stream completes.
 */
export function parsePartialAIActions(content: string): PartialAIActionsResult {
  const idx = content.search(AI_ACTIONS_OPEN_RE)
  if (idx === -1) {
    return { hasFence: false, intro: content }
  }

  // Strip any preceding `<!-- ai-actions-ready -->` marker on its own line so
  // the markdown above the fence renders cleanly while streaming.
  const intro = content
    .slice(0, idx)
    .replace(/<!--\s*ai-actions-ready\s*-->\s*$/i, '')
    .replace(/\s+$/, '')

  return { hasFence: true, intro }
}
