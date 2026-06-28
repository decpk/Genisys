export interface StepperStep {
  /** Stable React key for the step. */
  id: string
  /** Optional short label shown under the number (e.g. "Confirm", "Choose"). */
  label?: string
}

export interface StepperProps {
  /** Ordered list of steps to render. */
  steps: StepperStep[]
  /** Zero-based index of the currently focused step. */
  currentIndex: number
  /** Set of step ids that have an answer (rendered as completed). */
  answeredIds: ReadonlySet<string>
  /** Called when the user clicks a step. Implementation should gate forward jumps. */
  onStepClick?: (index: number) => void
}
