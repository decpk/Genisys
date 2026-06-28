/**
 * Matches the `ai-plan` fenced code block (and any trailing whitespace).
 * Stripped before sending content to the markdown renderer.
 */
const AI_PLAN_FENCE_RE = /```ai-plan\s*\n[\s\S]*?```\s*/g

/**
 * Matches `<!-- ai-step: ... -->` HTML comments (and trailing whitespace).
 * The comments are metadata only — the renderer must not show them as prose.
 */
const AI_STEP_COMMENT_RE = /<!--\s*ai-step:[^>]*?-->\s*/gi

/**
 * Removes every `ai-plan` fence and every `<!-- ai-step -->` marker from a
 * piece of message content so the markdown renderer never displays them.
 *
 * Idempotent: safe to call on content that has no markers (returns as-is).
 */
export function stripAIPlanMarkers(content: string): string {
  if (!content) return content
  return content
    .replace(AI_PLAN_FENCE_RE, '')
    .replace(AI_STEP_COMMENT_RE, '')
}
