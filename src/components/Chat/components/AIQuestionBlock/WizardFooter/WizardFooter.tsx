import { memo } from 'react'
import { ArrowLeft, ArrowRight, Send, SkipForward } from 'lucide-react'

import { wizardFooterStyles as styles } from './WizardFooter.styles'
import type { WizardFooterProps } from './WizardFooter.types'

/**
 * Footer for the AI question wizard. Hosts Back / Skip / Next-or-Submit
 * controls plus an "answered count" indicator.
 */
export const WizardFooter = memo(function WizardFooter(
  props: WizardFooterProps,
): React.JSX.Element {
  const {
    totalSteps,
    answeredCount,
    isBackDisabled,
    isNextDisabled,
    isLastStep,
    onSkip,
    onBack,
    onNext,
  } = props

  let skipNode: React.ReactNode = null
  if (onSkip) {
    skipNode = (
      <button type="button" className={styles.skipButton} onClick={onSkip}>
        <SkipForward size={12} />
        Skip
      </button>
    )
  }

  let primaryLabel: React.ReactNode = (
    <>
      Next
      <ArrowRight size={12} />
    </>
  )
  let primaryClass = styles.primaryButton
  if (isLastStep) {
    primaryLabel = (
      <>
        <Send size={12} />
        Submit all
      </>
    )
    primaryClass = styles.primaryButtonSubmit
  }

  return (
    <div className={styles.root}>
      <span className={styles.meta}>
        <span className={styles.metaPill}>
          {answeredCount} / {totalSteps} answered
        </span>
      </span>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        disabled={isBackDisabled}
      >
        <ArrowLeft size={12} />
        Back
      </button>
      {skipNode}
      <button
        type="button"
        className={primaryClass}
        onClick={onNext}
        disabled={isNextDisabled}
      >
        {primaryLabel}
      </button>
    </div>
  )
})
