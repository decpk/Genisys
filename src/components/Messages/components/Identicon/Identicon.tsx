import { cn } from '@/lib/utils'

import { identiconStyles } from './Identicon.styles'
import type { IdenticonProps } from './Identicon.types'
import { useIdenticonData } from './useIdenticonData'

const CELL = 20 // 100 / 5

export function Identicon(props: IdenticonProps): React.JSX.Element {
  const { seed, size = 40, rounded = true, className } = props
  const { gradient, cells, gradientId } = useIdenticonData(seed)

  const dots: React.JSX.Element[] = []
  cells.forEach((row, r) => {
    row.forEach((on, c) => {
      if (!on) return
      dots.push(
        <rect
          key={`${r}-${c}`}
          x={c * CELL}
          y={r * CELL}
          width={CELL}
          height={CELL}
          rx={2.5}
          fill="rgba(255,255,255,0.82)"
        />
      )
    })
  })

  return (
    <div
      className={cn(identiconStyles.root, rounded && 'rounded-full', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className={identiconStyles.svg}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gradientId})`} />
        {dots}
      </svg>
    </div>
  )
}
