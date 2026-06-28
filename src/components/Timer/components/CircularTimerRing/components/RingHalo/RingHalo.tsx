import { RING_GLOW_HALO_CLASS } from '../../CircularTimerRing.styles'

import type { RingHaloProps } from './RingHalo.types'

const INTENSITY_OPACITY: Record<'subtle' | 'strong', number> = {
  subtle: 0.22,
  strong: 0.45,
}

export function RingHalo(props: RingHaloProps): React.JSX.Element {
  const { color, intensity } = props
  const opacity = INTENSITY_OPACITY[intensity]
  return (
    <div
      className={RING_GLOW_HALO_CLASS}
      style={{ backgroundColor: color, opacity }}
      aria-hidden
    />
  )
}
