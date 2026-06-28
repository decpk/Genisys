import { cn } from '@/lib/utils'

import { PRESENCE_COLORS, presenceDotStyles } from './PresenceDot.styles'
import type { PresenceDotProps } from './PresenceDot.types'

export function PresenceDot(props: PresenceDotProps): React.JSX.Element {
  const { status, size = 9, className } = props
  const color = PRESENCE_COLORS[status]
  const isLive = status === 'connected' || status === 'connecting'

  let ping: React.JSX.Element | null = null
  if (isLive) {
    ping = <span className={cn(presenceDotStyles.ping, color)} />
  }

  return (
    <span
      className={cn(presenceDotStyles.root, className)}
      style={{ width: size, height: size }}
    >
      {ping}
      <span className={cn(presenceDotStyles.dot, color)} />
    </span>
  )
}
