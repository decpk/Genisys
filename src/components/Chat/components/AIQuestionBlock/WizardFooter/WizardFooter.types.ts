export interface WizardFooterProps {
  /** Total step count (used for the "answered" pill). */
  totalSteps: number
  /** Number of steps that already have an answer. */
  answeredCount: number
  /** Disable the Back button (true on the first step). */
  isBackDisabled: boolean
  /** Disable the primary Next/Submit button (true when current step has no answer). */
  isNextDisabled: boolean
  /** Show "Submit All" instead of "Next" (true on the final step). */
  isLastStep: boolean
  /** Optional Skip button — shown when provided. */
  onSkip?: () => void
  /** Called when Back is clicked. */
  onBack: () => void
  /** Called when Next / Submit All is clicked. */
  onNext: () => void
}
