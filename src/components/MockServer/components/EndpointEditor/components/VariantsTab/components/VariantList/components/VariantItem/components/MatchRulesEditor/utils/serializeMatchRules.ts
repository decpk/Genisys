import type { Rule } from '../MatchRulesEditor.types'

export function serializeMatchRules(rules: Rule[]): string {
  return JSON.stringify(rules)
}
