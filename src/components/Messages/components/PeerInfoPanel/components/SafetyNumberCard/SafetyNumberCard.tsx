import { Fingerprint, Hash } from 'lucide-react'

import { safetyNumberCardStyles as s } from './SafetyNumberCard.styles'
import type { SafetyNumberCardProps } from './SafetyNumberCard.types'

export function SafetyNumberCard(props: SafetyNumberCardProps): React.JSX.Element {
  const { fingerprint, safetyNumber } = props

  let safetyBody: React.JSX.Element
  if (safetyNumber) {
    const groups = safetyNumber.split(' ')
    safetyBody = (
      <div className={s.safetyGrid}>
        {groups.map((group, index) => (
          <span key={`${group}-${index}`} className={s.safetyGroup}>
            {group}
          </span>
        ))}
      </div>
    )
  } else {
    safetyBody = <p className={s.empty}>Available once the peer is connected.</p>
  }

  return (
    <div className={s.root}>
      <span className={s.label}>
        <Fingerprint className={s.labelIcon} />
        Key fingerprint
      </span>
      <p className={s.fingerprint}>{fingerprint}</p>

      <span className={s.safetyLabel}>
        <Hash className={s.labelIcon} />
        Safety number
      </span>
      {safetyBody}
      <p className={s.hint}>
        Compare these digits out loud or in person. If they match on both
        devices, your connection is private and unintercepted.
      </p>
    </div>
  )
}
