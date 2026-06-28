export interface DummyDataCountControlProps {
  /** Current item count. */
  value: number
  /** Called with the next (unclamped) value when the input changes. */
  onChange: (value: number) => void
}
