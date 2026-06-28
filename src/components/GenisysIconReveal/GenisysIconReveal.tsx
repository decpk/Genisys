import { useCallback, useEffect, useState } from 'react'
import type { GenisysIconRevealProps } from './GenisysIconReveal.types'

/**
 * Animated Genisys mark — three stacked layers that assemble into the logo.
 *
 * On play the bottom layer settles first, then the middle, then the top diamond
 * drops onto the stack, each fading and dropping into place with a soft settle.
 * The animation is pure CSS (see `.genisys-mark` rules in `src/assets/main.css`);
 * this component only owns the markup and the re-trigger logic.
 *
 * Plays once on mount. Replays on hover (`replayOnHover`, default on) and can be
 * looped (`loop`). Respects `prefers-reduced-motion` via the shared CSS, which
 * shows the static fully-assembled mark with no motion.
 *
 * Static usages should keep using <GenisysIcon> — this variant is additive.
 */
export function GenisysIconReveal({
  size = 28,
  className = '',
  replayOnHover = true,
  loop = false,
}: GenisysIconRevealProps): React.JSX.Element {
  // Bumping `playKey` remounts the inner group, which restarts the CSS
  // animations — the simplest reliable way to replay keyframes on demand.
  const [playKey, setPlayKey] = useState(0)

  const replay = useCallback(() => setPlayKey((k) => k + 1), [])

  useEffect(() => {
    if (!loop) return
    const id = window.setInterval(replay, 4200)
    return () => window.clearInterval(id)
  }, [loop, replay])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`genisys-mark ${className}`}
      style={{ overflow: 'visible' }}
      role="img"
      aria-label="Genisys"
      onMouseEnter={replayOnHover ? replay : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        key={playKey}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Three stacked layers — they assemble bottom → middle → top. */}
        <polyline className="dv-layer dv-l-bottom" points="5,22 16,28 27,22" />
        <polyline className="dv-layer dv-l-mid" points="5,16 16,22 27,16" />
        <polygon className="dv-layer dv-l-top" points="16,4 27,10 16,16 5,10" />
      </g>
    </svg>
  )
}
