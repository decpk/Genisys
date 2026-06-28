import type { AIPlanStep, AIPlanStepStatus } from '../AIPlanProgress.types'

/** Matches the first `ai-plan` fenced code block (non-greedy). */
const AI_PLAN_RE = /```ai-plan\s*\n([\s\S]*?)```/

const VALID_STATUSES: ReadonlySet<AIPlanStepStatus> = new Set([
  'pending',
  'running',
  'done',
  'error',
])

function coerceStatus(value: unknown): AIPlanStepStatus {
  if (typeof value === 'string' && VALID_STATUSES.has(value as AIPlanStepStatus)) {
    return value as AIPlanStepStatus
  }
  return 'pending'
}

function coerceStep(raw: unknown, index: number): AIPlanStep | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const titleValue = obj.title
  if (typeof titleValue !== 'string' || titleValue.trim().length === 0) return null

  const idValue = obj.id
  let id: string
  if (typeof idValue === 'string' && idValue.length > 0) {
    id = idValue
  } else if (typeof idValue === 'number' && Number.isFinite(idValue)) {
    id = String(idValue)
  } else {
    id = String(index + 1)
  }

  let detail: string | undefined
  if (typeof obj.detail === 'string' && obj.detail.length > 0) {
    detail = obj.detail
  }

  return {
    id,
    title: titleValue,
    status: coerceStatus(obj.status),
    detail,
  }
}

/**
 * Extracts the published step list from an `ai-plan` fenced code block.
 *
 * Returns `[]` when:
 *  - no fence is present (model didn't declare a plan)
 *  - the fence body isn't valid JSON
 *  - the JSON isn't an array
 *  - none of the entries pass validation
 *
 * The fence body MUST be a JSON array of `{ id, title, status?, detail? }`.
 */
export function extractPlanFence(content: string): AIPlanStep[] {
  if (!content) return []
  const match = AI_PLAN_RE.exec(content)
  if (!match) return []

  const body = match[1].trim()
  if (!body) return []

  try {
    const parsed: unknown = JSON.parse(body)
    if (!Array.isArray(parsed)) return []
    const steps: AIPlanStep[] = []
    parsed.forEach((raw, idx) => {
      const step = coerceStep(raw, idx)
      if (step) steps.push(step)
    })
    return steps
  } catch {
    return []
  }
}
