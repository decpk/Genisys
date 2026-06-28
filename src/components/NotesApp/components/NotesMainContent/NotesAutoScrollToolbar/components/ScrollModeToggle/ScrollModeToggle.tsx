import { Gauge, Footprints } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { useAutoScrollMode } from '../../hooks/useAutoScrollMode';
import { ScrollModeInfoPopover } from '../ScrollModeInfoPopover';
import { notesAutoScrollToolbarStyles as styles } from '../../NotesAutoScrollToolbar.styles';
import { cn } from '@/lib/utils';

/**
 * ScrollModeToggle
 *
 * Segmented control to switch the Notes auto-scroll between:
 * - Continuous: smooth constant-velocity scrolling.
 * - Stepped: jump by a fixed pixel distance, pause, then repeat.
 *
 * An info icon to the right reveals a playful note about hands-free reading.
 */
export function ScrollModeToggle() {
  const { mode, setMode } = useAutoScrollMode();

  const isContinuous = mode === 'continuous';
  const isStepped = mode === 'stepped';

  return (
    <div className={styles.modeGroup}>
      <div className={styles.modeToggle} role="group" aria-label="Auto-scroll mode">
        <Tooltip content="Continuous scrolling" side="top">
          <button
            type="button"
            onClick={() => setMode('continuous')}
            className={cn(
              styles.modeToggleBtn,
              isContinuous ? styles.modeToggleBtnActive : styles.modeToggleBtnIdle
            )}
            aria-pressed={isContinuous}
          >
            <Gauge size={12} />
            Continuous
          </button>
        </Tooltip>

        <Tooltip content="Stepped scrolling — jump, pause, repeat" side="top">
          <button
            type="button"
            onClick={() => setMode('stepped')}
            className={cn(
              styles.modeToggleBtn,
              isStepped ? styles.modeToggleBtnActive : styles.modeToggleBtnIdle
            )}
            aria-pressed={isStepped}
          >
            <Footprints size={12} />
            Stepped
          </button>
        </Tooltip>
      </div>

      <ScrollModeInfoPopover />
    </div>
  );
}
