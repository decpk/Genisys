export interface MinutesStepperProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  /** Suffix label shown after the number (e.g. "min"). */
  suffix?: string
  className?: string
  ariaLabel?: string
}
