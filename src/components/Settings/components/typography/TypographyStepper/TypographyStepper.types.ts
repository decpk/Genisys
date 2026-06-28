export interface TypographyStepperProps {
  value: number
  onChange: (next: number) => void
  min: number
  max: number
  step: number
  defaultValue: number
  /** How to render the value (e.g. `(v) => `${v}px`` or `(v) => v.toFixed(1)`). */
  format: (value: number) => string
  /** Number of decimals to keep when stepping (avoids floating-point drift). */
  decimals?: number
  decreaseTooltip?: string
  increaseTooltip?: string
  resetTooltip?: string
}
