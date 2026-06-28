import type { MatchRuleOp, MatchRuleSource, Rule } from '../MatchRulesEditor.types'

const VALID_SOURCES: MatchRuleSource[] = ['query', 'header', 'body']
const VALID_OPS: MatchRuleOp[] = ['equals', 'contains', 'exists']

function coerceSource(value: unknown): MatchRuleSource {
  return VALID_SOURCES.includes(value as MatchRuleSource)
    ? (value as MatchRuleSource)
    : 'query'
}

function coerceOp(value: unknown): MatchRuleOp {
  return VALID_OPS.includes(value as MatchRuleOp) ? (value as MatchRuleOp) : 'equals'
}

function coerceString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function parseMatchRules(raw: string): Rule[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((entry) => ({
      source: coerceSource((entry as Rule)?.source),
      key: coerceString((entry as Rule)?.key),
      op: coerceOp((entry as Rule)?.op),
      value: coerceString((entry as Rule)?.value),
    }))
  } catch {
    return []
  }
}
