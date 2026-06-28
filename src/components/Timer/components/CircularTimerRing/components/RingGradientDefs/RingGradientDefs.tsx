import type { RingGradientDefsProps } from './RingGradientDefs.types'

export function RingGradientDefs(props: RingGradientDefsProps): React.JSX.Element {
  const { id, colorFrom, colorTo } = props
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={colorFrom} />
        <stop offset="100%" stopColor={colorTo} />
      </linearGradient>
    </defs>
  )
}
