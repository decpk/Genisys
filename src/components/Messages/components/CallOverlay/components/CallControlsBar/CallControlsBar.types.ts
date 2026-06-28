import type { ActiveCall } from '@/components/Messages/Messages.types'

import type { CallControlHandlers } from '../../CallOverlay.types'
import type { CallControlVariant } from '../CallControlButton'

export interface CallControlsBarProps {
  call: ActiveCall
  handlers: CallControlHandlers
}

export interface CallControlDescriptor {
  key: string
  icon: React.JSX.Element
  active: boolean
  onClick: () => void
  label: string
  variant: CallControlVariant
}

export interface CallControlsBarData {
  controls: CallControlDescriptor[]
}
