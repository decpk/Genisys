import type { GenisysIconProps } from './GenisysIcon.types'

export function GenisysIcon({
  size = 28,
  className = ''
}: GenisysIconProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="16,4 27,10 16,16 5,10" />
        <polyline points="5,16 16,22 27,16" />
        <polyline points="5,22 16,28 27,22" />
      </g>
    </svg>
  )
}
