import { Plus } from 'lucide-react'

import { useMatchRulesEditorData } from './useMatchRulesEditorData'
import { MatchRuleRow } from './components/MatchRuleRow'
import type { MatchRulesEditorProps } from './MatchRulesEditor.types'
import { matchRulesEditorStyles as styles } from './MatchRulesEditor.styles'

export function MatchRulesEditor(props: MatchRulesEditorProps) {
  const { value, onChange } = props
  const { rules, addRule, removeRule, updateRule } = useMatchRulesEditorData(
    value,
    onChange
  )

  let hint: React.ReactNode = null
  if (rules.length === 0) {
    hint = <div className={styles.hint}>No rules — this variant matches every request.</div>
  }

  return (
    <div className={styles.root}>
      <span className={styles.label}>Match rules (all must pass)</span>
      {hint}
      {rules.map((rule, index) => (
        <MatchRuleRow
          key={index}
          rule={rule}
          index={index}
          onUpdate={updateRule}
          onRemove={removeRule}
        />
      ))}
      <button type="button" onClick={addRule} className={styles.addButton}>
        <Plus className="h-3.5 w-3.5" />
        Add rule
      </button>
    </div>
  )
}
