import { useCallback, useMemo } from 'react'

import { parseMatchRules } from './utils/parseMatchRules'
import { serializeMatchRules } from './utils/serializeMatchRules'
import type { Rule } from './MatchRulesEditor.types'

export function useMatchRulesEditorData(
  value: string,
  onChange: (rules: string) => void
) {
  const rules = useMemo(() => parseMatchRules(value), [value])

  const commit = useCallback(
    (next: Rule[]) => onChange(serializeMatchRules(next)),
    [onChange]
  )

  const addRule = useCallback(() => {
    commit([...rules, { source: 'query', key: '', op: 'equals', value: '' }])
  }, [rules, commit])

  const removeRule = useCallback(
    (index: number) => {
      commit(rules.filter((_, i) => i !== index))
    },
    [rules, commit]
  )

  const updateRule = useCallback(
    (index: number, patch: Partial<Rule>) => {
      commit(rules.map((r, i) => (i === index ? { ...r, ...patch } : r)))
    },
    [rules, commit]
  )

  return { rules, addRule, removeRule, updateRule }
}
