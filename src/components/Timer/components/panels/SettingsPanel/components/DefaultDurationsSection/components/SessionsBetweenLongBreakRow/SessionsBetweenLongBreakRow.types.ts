export interface SessionsBetweenLongBreakRowProps {
  /** Current value (whole sessions). */
  value: number
  /** Called whenever the value changes. */
  onChange: (next: number) => void
}
