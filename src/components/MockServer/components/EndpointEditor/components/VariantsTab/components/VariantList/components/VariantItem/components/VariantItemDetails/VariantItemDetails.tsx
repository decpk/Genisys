import { StaticResponseTab } from '@/components/MockServer/components/EndpointEditor/StaticResponseTab'

import { MatchRulesEditor } from '../MatchRulesEditor'
import type { VariantItemDetailsProps } from './VariantItemDetails.types'
import { variantItemDetailsStyles as styles } from './VariantItemDetails.styles'

export function VariantItemDetails(props: VariantItemDetailsProps) {
  const {
    mode,
    body,
    onBodyChange,
    weight,
    onWeightChange,
    onWeightBlur,
    matchRules,
    onMatchRulesChange,
  } = props

  let weightBlock: React.ReactNode = null
  if (mode === 'random') {
    weightBlock = (
      <div className={styles.field}>
        <span className={styles.label}>Weight</span>
        <input
          type="number"
          min={1}
          value={weight}
          onChange={(e) => onWeightChange(Math.max(1, Number(e.target.value) || 1))}
          onBlur={onWeightBlur}
          className={styles.weightInput}
        />
      </div>
    )
  }

  let rulesBlock: React.ReactNode = null
  if (mode === 'conditional') {
    rulesBlock = <MatchRulesEditor value={matchRules} onChange={onMatchRulesChange} />
  }

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <span className={styles.label}>Response body</span>
        <div className={styles.bodyWrap}>
          <StaticResponseTab value={body} onChange={onBodyChange} />
        </div>
      </div>
      {weightBlock}
      {rulesBlock}
    </div>
  )
}
