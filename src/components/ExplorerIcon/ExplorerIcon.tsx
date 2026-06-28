import type { ExplorerIconProps } from './ExplorerIcon.types'

/**
 * Explorer activity-bar icon.
 *
 * Depicts a folder in its *opened* state:
 *   - the back panel (with the tab) is drawn behind, showing only the
 *     portion that peeks above the front lip,
 *   - the front lid leans forward as a trapezoid (wider at the top,
 *     narrower at the bottom) — the classic "folder open" silhouette.
 *
 * Uses `currentColor` and stroke-only geometry so it inherits the
 * ActivityBar button's active / inactive colors and respects the
 * dynamic `strokeWidth` AppModeButton passes in.
 */
export function ExplorerIcon({
  size = 24,
  strokeWidth = 2,
  className = '',
}: ExplorerIconProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Back panel: only the top edges + tab visible above the front lip. */}
      <path d="M3 11 V6.5 A1.5 1.5 0 0 1 4.5 5 H8.5 L10.5 7 H19.5 A1.5 1.5 0 0 1 21 8.5 V11" />
      {/* Front lid leaning forward — trapezoid, wider on top, narrower on bottom. */}
      <path d="M2 11 H22 L20.25 18.6 A1.6 1.6 0 0 1 18.7 20 H5.3 A1.6 1.6 0 0 1 3.75 18.6 Z" />
    </svg>
  )
}
