import { Pause, Play } from 'lucide-react'

import type { PrimaryActionIconProps } from './PrimaryActionIcon.types'

export function PrimaryActionIcon(props: PrimaryActionIconProps): React.JSX.Element {
  const { isRunning, size, fill } = props
  if (isRunning) return <Pause size={size} fill={fill} />
  return <Play size={size} fill={fill} />
}
