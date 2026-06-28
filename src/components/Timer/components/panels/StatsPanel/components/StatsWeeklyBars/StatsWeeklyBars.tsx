import type { StatsWeeklyBarsProps } from './StatsWeeklyBars.types'

const LABELS = ['T', 'Y', '5d', '4d', '3d', '2d', '7d']

export function StatsWeeklyBars(
  props: StatsWeeklyBarsProps,
): React.JSX.Element {
  const { weekly } = props

  const max = Math.max(1, ...weekly)
  const width = 200
  const height = 60
  const barWidth = width / weekly.length - 4

  return (
    <section className="flex flex-col gap-2 px-3 py-3 border-b border-border/40">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Last 7 days
      </div>
      <svg width={width} height={height + 14} className="text-primary">
        {weekly.map((mins, idx) => {
          const h = Math.round((mins / max) * height)
          const x = idx * (barWidth + 4)
          const y = height - h
          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={2}
                fill="currentColor"
                opacity={mins > 0 ? 0.85 : 0.2}
              />
              <text
                x={x + barWidth / 2}
                y={height + 12}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {LABELS[idx]}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}
