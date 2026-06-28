import { memo } from 'react'
import { Hourglass, Play, Hammer } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { continuePanelStyles as styles } from './ContinuePanel.styles'
import type { ContinuePanelProps } from './ContinuePanel.types'

/**
 * Indigo-tinted card shown when the agentic loop has used its full tool
 * budget for this turn. The user can either grant another budget worth
 * of iterations (Continue) or have the assistant summarise what it
 * already found (Stop & answer).
 *
 * Mirrors `ConfirmationPanel`'s structure so the two cards feel like
 * siblings, but uses an indigo palette to read as informational rather
 * than destructive.
 */
export const ContinuePanel = memo(function ContinuePanel(
  props: ContinuePanelProps,
): React.JSX.Element {
  const { request, onContinue, onStop } = props
  const { iterationsUsed, totalToolCalls } = request

  return (
    <div className={styles.root} role="alertdialog" aria-live="polite">
      <div className={styles.header}>
        <span className={styles.iconBadge}>
          <Hourglass size={14} className={styles.iconBadgeIcon} />
        </span>
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>Tool budget used</span>
          <span className={styles.title}>Continue working?</span>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.description}>
          The assistant has used its tool budget for this turn. Continue to grant another
          budget worth of tool calls, or stop and have it answer with what it has so far.
        </p>
        <div className={styles.stats}>
          <span className={styles.statChip}>
            <Hammer size={9} />
            {iterationsUsed} iterations
          </span>
          <span className={styles.statChip}>{totalToolCalls} tool calls</span>
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onStop}
          className={styles.stopButton}
        >
          Stop &amp; answer
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onContinue}
          className={styles.continueButton}
        >
          <Play size={11} />
          Continue
        </Button>
      </div>
    </div>
  )
})
