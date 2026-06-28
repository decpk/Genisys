import { Play, Pause } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { SaveStatusIndicator } from '../SaveStatusIndicator';
import { useNotesAutoScrollData } from './hooks/useNotesAutoScrollData';
import { ScrollModeToggle } from './components/ScrollModeToggle';
import { ContinuousScrollControls } from './components/ContinuousScrollControls';
import { SteppedScrollControls } from './components/SteppedScrollControls';
import { notesAutoScrollToolbarStyles as styles } from './NotesAutoScrollToolbar.styles';
import { convertMultiplierToPixelsPerSecond } from './utils/speedConversion';
import { formatStepPixels } from './utils/formatStepPixels';
import { formatStepInterval } from './utils/formatStepInterval';
import { cn } from '@/lib/utils';
import type { NotesAutoScrollToolbarProps } from './NotesAutoScrollToolbar.types';

/**
 * NotesAutoScrollToolbar
 *
 * Bottom toolbar for the Notes editor with auto-scroll controls:
 * - Mode toggle: Continuous vs Stepped scrolling
 * - Play/Pause button to toggle auto-scroll
 * - Continuous mode: speed multiplier slider
 * - Stepped mode: pixel-distance and wait-interval sliders
 *
 * Only visible in main Notes app (not in read-only or right-panel modes).
 */
export function NotesAutoScrollToolbar(props: NotesAutoScrollToolbarProps) {
  const { saveStatus } = props;
  const {
    isRunning,
    speedMultiplier,
    mode,
    stepPixels,
    stepIntervalMs,
    toggleAutoScroll,
  } = useNotesAutoScrollData();

  const isStepped = mode === 'stepped';

  // Compute mode-specific pieces ahead of the JSX (no ternaries in markup).
  let controls = <ContinuousScrollControls />;
  let rightInfo = `${convertMultiplierToPixelsPerSecond(speedMultiplier).toFixed(0)} px/s`;
  let rightTooltip = `${convertMultiplierToPixelsPerSecond(speedMultiplier).toFixed(0)} pixels/second`;

  if (isStepped) {
    controls = <SteppedScrollControls />;
    rightInfo = `${formatStepPixels(stepPixels)} / ${formatStepInterval(stepIntervalMs)}`;
    rightTooltip = `Jump ${formatStepPixels(stepPixels)} every ${formatStepInterval(stepIntervalMs)}`;
  }

  return (
    <div className={styles.container}>
      {/* Left: Save status indicator */}
      <div className={styles.leftSection}>
        {saveStatus && <SaveStatusIndicator status={saveStatus} />}
      </div>

      {/* Center: Mode toggle + Play/Pause + Controls */}
      <div className={styles.centerSection}>
        <ScrollModeToggle />

        <Tooltip content={isRunning ? 'Pause auto-scroll' : 'Start auto-scroll'} side="top">
          <button
            type="button"
            onClick={toggleAutoScroll}
            className={cn(
              styles.playPauseBtn,
              isRunning ? styles.playPauseBtnActive : styles.playPauseBtnIdle
            )}
            aria-pressed={isRunning}
            aria-label={isRunning ? 'Pause' : 'Play'}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </Tooltip>

        {controls}
      </div>

      {/* Right: Mode-specific info */}
      <div className={styles.rightSection}>
        <Tooltip content={rightTooltip} side="top">
          <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">
            {rightInfo}
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
