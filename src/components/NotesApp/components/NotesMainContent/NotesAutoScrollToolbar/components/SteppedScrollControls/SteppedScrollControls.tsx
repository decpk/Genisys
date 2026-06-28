import { Slider } from '@/components/ui/slider';
import { useAutoScrollStep } from '../../hooks/useAutoScrollStep';
import { StepCountdown } from '../StepCountdown';
import { notesAutoScrollToolbarStyles as styles } from '../../NotesAutoScrollToolbar.styles';
import { formatStepPixels } from '../../utils/formatStepPixels';
import { formatStepInterval } from '../../utils/formatStepInterval';
import {
  MIN_STEP_PIXELS,
  MAX_STEP_PIXELS,
  STEP_PIXELS_INCREMENT,
  MIN_STEP_INTERVAL_MS,
  MAX_STEP_INTERVAL_MS,
  STEP_INTERVAL_INCREMENT_MS,
} from '../../utils/autoScrollConstants';

/**
 * SteppedScrollControls
 *
 * Controls for the stepped (interval) auto-scroll mode:
 * - "Step" slider: pixel distance moved on each jump.
 * - "Every" slider: wait interval between jumps.
 */
export function SteppedScrollControls() {
  const { stepPixels, stepIntervalMs, setStepPixels, setStepIntervalMs } = useAutoScrollStep();

  return (
    <div className={styles.stepContainer}>
      {/* Pixel distance per step */}
      <div className={styles.stepField}>
        <span className={styles.stepLabel}>Step:</span>
        <Slider
          value={[stepPixels]}
          onValueChange={(value) => setStepPixels(value[0])}
          min={MIN_STEP_PIXELS}
          max={MAX_STEP_PIXELS}
          step={STEP_PIXELS_INCREMENT}
          aria-label="Pixels per step"
          className="w-40"
        />
        <span className={styles.stepValue}>{formatStepPixels(stepPixels)}</span>
      </div>

      {/* Wait interval between steps */}
      <div className={styles.stepField}>
        <span className={styles.stepLabel}>Every:</span>
        <Slider
          value={[stepIntervalMs]}
          onValueChange={(value) => setStepIntervalMs(value[0])}
          min={MIN_STEP_INTERVAL_MS}
          max={MAX_STEP_INTERVAL_MS}
          step={STEP_INTERVAL_INCREMENT_MS}
          aria-label="Wait interval between steps"
          className="w-40"
        />
        <span className={styles.stepValue}>{formatStepInterval(stepIntervalMs)}</span>
      </div>

      {/* Live countdown to the next scroll step */}
      <StepCountdown />
    </div>
  );
}
