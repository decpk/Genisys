import { Network } from 'lucide-react'

import { PresenceDot } from '@/components/Messages/components/PresenceDot'
import { formatPeerStatus } from '@/components/Messages/utils/formatPeerStatus'

import { connectionDetailsCardStyles as s } from './ConnectionDetailsCard.styles'
import type { ConnectionDetailsCardProps } from './ConnectionDetailsCard.types'

export function ConnectionDetailsCard(
  props: ConnectionDetailsCardProps
): React.JSX.Element {
  const { peer } = props

  return (
    <div className={s.root}>
      <span className={s.label}>
        <Network className={s.labelIcon} />
        Connection
      </span>
      <div className={s.rows}>
        <div className={s.row}>
          <span className={s.key}>Address</span>
          <span className={s.value}>
            {peer.host}:{peer.port}
          </span>
        </div>
        <div className={s.row}>
          <span className={s.key}>Status</span>
          <span className={s.statusValue}>
            <PresenceDot status={peer.status} size={8} />
            {formatPeerStatus(peer.status)}
          </span>
        </div>
      </div>
    </div>
  )
}
