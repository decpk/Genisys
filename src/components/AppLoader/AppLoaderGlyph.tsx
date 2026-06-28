import { cn } from '@/lib/utils'

interface AppLoaderGlyphProps {
  size?: number
  className?: string
}

const SPOKE_COUNT = 12

const SPOKE_OPACITY = Array.from({ length: SPOKE_COUNT }, (_, index) =>
  ((index + 1) / SPOKE_COUNT).toFixed(2),
)

export function AppLoaderGlyph({ size = 16, className }: AppLoaderGlyphProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 20 20"
      className={cn('block shrink-0 text-foreground/80', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <g transform="translate(10 10)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0"
          to="360"
          dur="0.9s"
          calcMode="discrete"
          values="0;30;60;90;120;150;180;210;240;270;300;330;360"
          keyTimes="0;0.0833;0.1667;0.25;0.3333;0.4167;0.5;0.5833;0.6667;0.75;0.8333;0.9167;1"
          repeatCount="indefinite"
          additive="sum"
        />
        {SPOKE_OPACITY.map((opacity, index) => {
          const rotate = (360 / SPOKE_COUNT) * index

          return (
            <rect
              key={index}
              x={-0.9}
              y={-8.2}
              width={1.8}
              height={4.2}
              rx={0.9}
              fill="currentColor"
              opacity={opacity}
              transform={`rotate(${rotate})`}
            />
          )
        })}
      </g>
    </svg>
  )
}