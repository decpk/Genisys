import { memo, Fragment } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { stepperStyles as styles } from './Stepper.styles'
import type { StepperProps } from './Stepper.types'

interface StepStatusInfo {
  isCurrent: boolean
  isCompleted: boolean
  isClickable: boolean
}

function getStepStatus(args: {
  index: number
  currentIndex: number
  isAnswered: boolean
}): StepStatusInfo {
  const { index, currentIndex, isAnswered } = args
  const isCurrent = index === currentIndex
  const isCompleted = isAnswered && !isCurrent
  // Free to go back; only forward to questions already answered.
  const isClickable = !isCurrent && (index < currentIndex || isAnswered)
  return { isCurrent, isCompleted, isClickable }
}

function getBubbleClass(status: StepStatusInfo): string {
  if (status.isCurrent) return styles.bubbleCurrent
  if (status.isCompleted) return styles.bubbleCompleted
  if (status.isClickable) return styles.bubbleUpcomingClickable
  return styles.bubbleUpcoming
}

/**
 * VS Code quick-pick-style numbered stepper used by the AI question wizard.
 * Each step shows a numbered bubble (or a check when completed); clicking
 * jumps to that step (back is always allowed, forward only to answered ones).
 */
export const Stepper = memo(function Stepper(props: StepperProps): React.JSX.Element {
  const { steps, currentIndex, answeredIds, onStepClick } = props

  return (
    <div className={styles.root} role="tablist">
      {steps.map((step, i) => {
        const status = getStepStatus({
          index: i,
          currentIndex,
          isAnswered: answeredIds.has(step.id),
        })
        const bubbleClass = cn(styles.bubbleBase, getBubbleClass(status))
        const labelClass = cn(styles.label, status.isCurrent && styles.labelCurrent)

        let bubbleContent: React.ReactNode = i + 1
        if (status.isCompleted) bubbleContent = <Check size={12} />

        const handleClick = (): void => {
          if (status.isClickable) onStepClick?.(i)
        }

        const connectorClass = cn(
          styles.connector,
          (status.isCompleted || i < currentIndex) && styles.connectorCompleted,
        )

        let connector: React.ReactNode = null
        if (i < steps.length - 1) connector = <span className={connectorClass} />

        return (
          <Fragment key={step.id}>
            <div className={styles.step}>
              <button
                type="button"
                className={bubbleClass}
                onClick={handleClick}
                disabled={!status.isClickable && !status.isCurrent}
                aria-current={status.isCurrent ? 'step' : undefined}
                aria-label={`Question ${i + 1}${step.label ? ` — ${step.label}` : ''}`}
              >
                {bubbleContent}
              </button>
              {step.label && <span className={labelClass}>{step.label}</span>}
            </div>
            {connector}
          </Fragment>
        )
      })}
    </div>
  )
})
