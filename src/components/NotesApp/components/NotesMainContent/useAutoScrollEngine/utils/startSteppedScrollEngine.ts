import { isNearScrollBottom } from './scrollingLogic';
import { smoothScrollBy } from './smoothScrollBy';
import { STEP_SMOOTH_JUMP_DURATION_MS } from '../../NotesAutoScrollToolbar/utils/autoScrollConstants';

/**
 * Optional lifecycle callbacks for surfacing the stepped engine's wait state
 * (e.g. to drive a countdown UI).
 */
export interface SteppedScrollCallbacks {
  /** Fired when a new wait begins, with the absolute Date.now timestamp of the next step. */
  onWaitStart?: (nextStepAt: number, intervalMs: number) => void;
  /** Fired when the engine stops waiting (paused, reached bottom, or torn down). */
  onIdle?: () => void;
}

/**
 * Starts a stepped (interval) auto-scroll loop for the given container.
 *
 * Behaviour: smoothly jumps the container down by `stepPixels`, waits
 * `intervalMs`, then repeats — pausing the page between each jump.
 *
 * Guard conditions:
 * - Stops automatically when reaching the bottom of the content.
 * - Stops when shouldStop() returns true (e.g. user pauses, note changes).
 * - The returned cleanup cancels any pending timer and in-flight jump.
 *
 * @param container - HTML scroll container
 * @param stepPixels - Pixel distance to jump on each step
 * @param intervalMs - Wait time between steps, in milliseconds
 * @param shouldStop - Callback to check if scrolling should stop
 * @param callbacks - Optional wait-state callbacks for countdown UI
 * @returns Cleanup function to call on unmount or manual stop
 */
export function startSteppedScrollEngine(
  container: HTMLDivElement,
  stepPixels: number,
  intervalMs: number,
  shouldStop: () => boolean,
  callbacks: SteppedScrollCallbacks = {}
): () => void {
  const { onWaitStart, onIdle } = callbacks;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let cancelJump: (() => void) | null = null;

  const scheduleNext = () => {
    onWaitStart?.(Date.now() + intervalMs, intervalMs);
    timerId = setTimeout(runStep, intervalMs);
  };

  const runStep = () => {
    timerId = null;

    if (shouldStop() || isNearScrollBottom(container)) {
      onIdle?.();
      return;
    }

    cancelJump = smoothScrollBy(container, stepPixels, STEP_SMOOTH_JUMP_DURATION_MS, () => {
      cancelJump = null;
      if (shouldStop() || isNearScrollBottom(container)) {
        onIdle?.();
        return;
      }
      scheduleNext();
    });
  };

  // Wait the full interval before the first jump, then settle into the
  // wait/step cadence. (Clicking play should not scroll instantly.)
  scheduleNext();

  return () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (cancelJump) {
      cancelJump();
      cancelJump = null;
    }
    onIdle?.();
  };
}
