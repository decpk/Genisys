import { Timer } from 'lucide-react';
import { useStepCountdown } from '../../hooks/useStepCountdown';
import { notesAutoScrollToolbarStyles as styles } from '../../NotesAutoScrollToolbar.styles';
import { formatCountdown } from '../../utils/formatCountdown';
import type { CountdownPhase } from '../../utils/getCountdownPhase';
import { cn } from '@/lib/utils';

/** Maps a countdown phase to its pill colour class. */
const PHASE_CLASS: Record<CountdownPhase, string> = {
  calm: styles.countdownCalm,
  warn: styles.countdownWarn,
  urgent: styles.countdownUrgent,
};

/**
 * StepCountdown
 *
 * A live pill showing the seconds remaining until the next stepped scroll.
 * Colour escalates as the moment approaches: white -> orange -> red (final
 * stretch). Only renders while a stepped countdown is active.
 */
export function StepCountdown() {
  const { isActive, remainingMs, phase } = useStepCountdown();

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={cn(styles.countdown, PHASE_CLASS[phase])}
      role="timer"
      aria-live="off"
      aria-label="Time until next scroll"
    >
      <Timer size={12} />
      {formatCountdown(remainingMs)}
      <span className={styles.countdownUnit}>s</span>
    </div>
  );
}
