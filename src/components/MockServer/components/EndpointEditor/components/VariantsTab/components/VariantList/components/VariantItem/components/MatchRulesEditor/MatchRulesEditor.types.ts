export type MatchRuleSource = 'query' | 'header' | 'body'
export type MatchRuleOp = 'equals' | 'contains' | 'exists'

export interface Rule {
  source: MatchRuleSource
  key: string
  op: MatchRuleOp
  value: string
}

export interface MatchRulesEditorProps {
  value: string
  onChange: (rules: string) => void
}
