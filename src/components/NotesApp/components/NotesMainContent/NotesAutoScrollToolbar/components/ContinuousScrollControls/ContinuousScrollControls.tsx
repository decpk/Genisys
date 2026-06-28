import { Slider } from '@/components/ui/slider';
import { useNotesAutoScrollData } from '../../hooks/useNotesAutoScrollData';
import { notesAutoScrollToolbarStyles as styles } from '../../NotesAutoScrollToolbar.styles';
import { formatSpeedDisplay } from '../../utils/speedConversion';
import { toPercent } from '../../utils/toPercent';
import { MIN_SPEED_MULTIPLIER, MAX_SPEED_MULTIPLIER } from '../../utils/autoScrollConstants';
import type { SpeedMultiplier } from '../../NotesAutoScrollToolbar.types';

/**
 * Preset speed stops shown as tick marks under the slider so the user can
 * see (and jump to) the intermediate speeds across the range.
 *
 * `major` presets render a text label; minor presets render only a divider tick.
 */
const SPEED_PRESETS: { value: SpeedMultiplier; major: boolean }[] = [
  { value: 0 as SpeedMultiplier, major: true },
  { value: 0.1 as SpeedMultiplier, major: false },
  { value: 0.2 as SpeedMultiplier, major: false },
  { value: 0.3 as SpeedMultiplier, major: false },
  { value: 0.4 as SpeedMultiplier, major: false },
  { value: 0.5 as SpeedMultiplier, major: true },
  { value: 0.6 as SpeedMultiplier, major: false },
  { value: 0.7 as SpeedMultiplier, major: false },
  { value: 0.8 as SpeedMultiplier, major: false },
  { value: 0.9 as SpeedMultiplier, major: false },
  { value: 1 as SpeedMultiplier, major: true },
  { value: 1.1 as SpeedMultiplier, major: false },
  { value: 1.2 as SpeedMultiplier, major: false },
  { value: 1.3 as SpeedMultiplier, major: false },
  { value: 1.4 as SpeedMultiplier, major: false },
  { value: 1.5 as SpeedMultiplier, major: true },
];

/**
 * ContinuousScrollControls
 *
 * Speed multiplier slider with preset tick marks for the continuous
 * auto-scroll mode.
 */
export function ContinuousScrollControls() {
  const { speedMultiplier, setSpeed } = useNotesAutoScrollData();
  const speedDisplay = formatSpeedDisplay(speedMultiplier);

  return (
    <div className={styles.sliderContainer}>
      <span className={styles.sliderLabel}>Speed:</span>

      <div className={styles.sliderColumn}>
        <Slider
          value={[speedMultiplier]}
          onValueChange={(value) => setSpeed(value[0] as SpeedMultiplier)}
          min={MIN_SPEED_MULTIPLIER}
          max={MAX_SPEED_MULTIPLIER}
          step={0.1}
          aria-label="Auto-scroll speed multiplier"
          className="w-72"
        />

        {/* Intermediate speed tick marks / presets */}
        <div className={styles.tickRow}>
          {SPEED_PRESETS.map(({ value, major }) => {
            const isActive = Math.abs(speedMultiplier - value) < 0.05;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(value)}
                style={{ left: `${toPercent(value, MIN_SPEED_MULTIPLIER, MAX_SPEED_MULTIPLIER)}%` }}
                className={`${styles.tick} ${isActive ? styles.tickActive : styles.tickIdle}`}
                aria-label={`Set speed to ${formatSpeedDisplay(value)}`}
                title={formatSpeedDisplay(value)}
              >
                <span className={`${styles.tickDot} ${major ? styles.tickDotMajor : ''}`} />
                {major && <span className={styles.tickLabel}>{formatSpeedDisplay(value)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <span className={styles.sliderValue}>{speedDisplay}</span>
    </div>
  );
}
