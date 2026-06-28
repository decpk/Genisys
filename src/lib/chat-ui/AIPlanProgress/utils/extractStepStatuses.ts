import type { AIPlanStepStatus } from '../AIPlanProgress.types'

/**
 * Matches `<!-- ai-step: id="X" status="Y" -->`-style HTML comments.
 * The attribute payload is captured and parsed by `parseAttributes`.
 */
const AI_STEP_RE = /<!--\s*ai-step:\s*([^>]*?)\s*-->/gi

/** Matches `key="value"` or `key=value` pairs inside an `ai-step` payload. */
const KEY_VALUE_RE = /(\w+)\s*=\s*"([^"]*)"|(\w+)\s*=\s*([^\s"]+)/g

const VALID_STATUSES: ReadonlySet<AIPlanStepStatus> = new Set([
  'pending',
  'running',
  'done',
  'error',
])

function parseAttributes(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  let match: RegExpExecArray | null
  KEY_VALUE_RE.lastIndex = 0
  while ((match = KEY_VALUE_RE.exec(raw)) !== null) {
    const key = (match[1] ?? match[3] ?? '').toLowerCase()
    const value = match[2] ?? match[4] ?? ''
    if (key.length > 0) out[key] = value
  }
  return out
}

/**
 * Scans an assistant message for `<!-- ai-step: id=... status=... -->` markers
 * and returns the **latest** status published for each step id.
 *
 * Later markers win — this matches the streaming pattern where the model emits
 * `running` then `done` for the same id as it progresses.
 */
export function extractStepStatuses(content: string): Map<string, AIPlanStepStatus> {
  const out = new Map<string, AIPlanStepStatus>()
  if (!content) return out

  let match: RegExpExecArray | null
  AI_STEP_RE.lastIndex = 0
  while ((match = AI_STEP_RE.exec(content)) !== null) {
    const attrs = parseAttributes(match[1])
    const id = attrs.id
    if (!id) continue
    const status = attrs.status as AIPlanStepStatus | undefined
    if (status && VALID_STATUSES.has(status)) {
      out.set(id, status)
    }
  }
  return out
}
