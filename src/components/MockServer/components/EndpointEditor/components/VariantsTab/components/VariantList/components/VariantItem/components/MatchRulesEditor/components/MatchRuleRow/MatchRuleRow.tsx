import { ChevronDown, Trash2 } from 'lucide-react'
import { Tooltip } from '@/components/Tooltip'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'

import type {
  MatchRuleOp,
  MatchRuleSource,
} from '../../MatchRulesEditor.types'

import type { MatchRuleRowProps } from './MatchRuleRow.types'
import { matchRuleRowStyles as styles } from './MatchRuleRow.styles'

const SOURCES: MatchRuleSource[] = ['query', 'header', 'body']
const OPS: MatchRuleOp[] = ['equals', 'contains', 'exists']

export function MatchRuleRow(props: MatchRuleRowProps) {
  const { rule, index, onUpdate, onRemove } = props

  const sourceItems: DropdownItem[] = SOURCES.map((source) => ({
    key: source,
    label: source,
    active: source === rule.source,
    onSelect: () => onUpdate(index, { source }),
  }))

  const opItems: DropdownItem[] = OPS.map((op) => ({
    key: op,
    label: op,
    active: op === rule.op,
    onSelect: () => onUpdate(index, { op }),
  }))

  const showValue = rule.op !== 'exists'
  let valueInput: React.ReactNode = null
  if (showValue) {
    valueInput = (
      <input
        value={rule.value}
        onChange={(e) => onUpdate(index, { value: e.target.value })}
        placeholder="value"
        className={styles.input}
      />
    )
  }

  return (
    <div className={styles.root}>
      <Dropdown
        items={sourceItems}
        openOn="click"
        align="left"
        showCheck
        menuWidth="140px"
        trigger={
          <button
            type="button"
            className={`${styles.select} inline-flex min-w-[92px] items-center justify-between gap-1.5`}
          >
            <span>{rule.source}</span>
            <ChevronDown size={12} className="opacity-60" />
          </button>
        }
      />
      <input
        value={rule.key}
        onChange={(e) => onUpdate(index, { key: e.target.value })}
        placeholder="key"
        className={styles.input}
      />
      <Dropdown
        items={opItems}
        openOn="click"
        align="left"
        showCheck
        menuWidth="140px"
        trigger={
          <button
            type="button"
            className={`${styles.select} inline-flex min-w-[92px] items-center justify-between gap-1.5`}
          >
            <span>{rule.op}</span>
            <ChevronDown size={12} className="opacity-60" />
          </button>
        }
      />
      {valueInput}
      <Tooltip content="Remove this rule" side="top">
        <button type="button" onClick={() => onRemove(index)} className={styles.removeBtn}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </div>
  )
}
