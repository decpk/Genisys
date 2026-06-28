import type { Rule } from '../../MatchRulesEditor.types'

export interface MatchRuleRowProps {
  rule: Rule
  index: number
  onUpdate: (index: number, patch: Partial<Rule>) => void
  onRemove: (index: number) => void
}
