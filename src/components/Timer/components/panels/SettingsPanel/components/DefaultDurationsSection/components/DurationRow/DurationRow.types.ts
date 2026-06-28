export interface DurationRowProps {
  /** Row label (e.g. "Work"). */
  label: string
  /** Current value in seconds. */
  valueSec: number
  /** Minimum allowed value in seconds. */
  minSec: number
  /** Maximum allowed value in seconds. */
  maxSec: number
  /** Slider step in seconds. */
  stepSec: number
  /** Called whenever the value changes (in seconds). */
  onChange: (nextSec: number) => void
}
