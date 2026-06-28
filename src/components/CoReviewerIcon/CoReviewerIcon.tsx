import type { GenisysIconProps } from './CoReviewerIcon.types'

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
      <rect
        x="1.5"
        y="4.5"
        width="29"
        height="23"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line x1="12" y1="4.5" x2="12" y2="27.5" stroke="currentColor" strokeWidth="2.2" />
      <line x1="12" y1="16" x2="30.5" y2="16" stroke="currentColor" strokeWidth="2.2" />
      <line x1="21" y1="16" x2="21" y2="27.5" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  )
}
