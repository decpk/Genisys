export interface GenisysIconRevealProps {
  /** Rendered width/height in px. Default 28. */
  size?: number
  className?: string
  /** Replay the reveal whenever the user hovers the mark. Default true. */
  replayOnHover?: boolean
  /** Loop the reveal continuously instead of playing once on mount. Default false. */
  loop?: boolean
}
