export interface MiniProgressRingProps {
  /** Hex/CSS color for the active progress arc. */
  color: string
  /** Outer pixel size of the ring. Default 32. */
  size?: number
  /** Stroke width in pixels. Default 3. */
  strokeWidth?: number
  /** Progress value 0..1. Default 0.65 (a pleasing in-progress preview). */
  progress?: number
  /** Optional className for the wrapper element. */
  className?: string
}
