import { scrollStep, isNearScrollBottom } from './scrollingLogic';

/**
 * Starts an auto-scroll RAF loop for the given container.
 * Scrolls smoothly at the specified px/second rate.
 *
 * Guard conditions:
 * - Stops automatically when reaching bottom
 * - Stops when shouldStop() returns true (e.g., read-only mode, note changed)
 * - Cleanup function cancels the RAF
 *
 * @param container - HTML scroll container
 * @param pxPerSecond - Pixels to scroll per second (derived from speed multiplier)
 * @param shouldStop - Callback to check if scrolling should stop
 * @returns Cleanup function to call on unmount or manual stop
 */
export function startAutoScrollEngine(
  container: HTMLDivElement,
  pxPerSecond: number,
  shouldStop: () => boolean
): () => void {
  let rafId: number | null = null;
  let lastScrollTime = performance.now();
  // Float accumulator for the scroll position. Reading container.scrollTop back
  // rounds to an integer, which would discard sub-pixel movement at slow speeds.
  let accumulatedScrollTop = container.scrollTop;
  // Exponentially-smoothed frame delta. requestAnimationFrame timing wobbles a
  // few ms frame-to-frame; feeding the raw delta straight into the position
  // produces a subtle speed jitter. Smoothing the delta keeps velocity steady
  // so motion reads as glassy-smooth.
  let smoothedDelta = 1000 / 60; // seed with an ideal 60fps frame (ms)

  const animate = (currentTime: number) => {
    // Guard: Stop if condition met (pause, note change, etc.)
    if (shouldStop()) {
      rafId = null;
      return;
    }

    // Guard: Stop if reached bottom
    if (isNearScrollBottom(container)) {
      rafId = null;
      return;
    }

    // Low-pass filter the frame delta (EMA, alpha=0.1) to damp timing jitter.
    const rawDelta = currentTime - lastScrollTime;
    smoothedDelta = smoothedDelta + (rawDelta - smoothedDelta) * 0.1;

    // Perform one scroll step using a synthetic, smoothed timestamp so the
    // effective per-frame delta is the filtered value.
    const smoothedTime = lastScrollTime + smoothedDelta;
    const result = scrollStep(container, pxPerSecond, smoothedTime, lastScrollTime, accumulatedScrollTop);
    lastScrollTime = currentTime;
    accumulatedScrollTop = result.scrollTop;

    // Schedule next frame
    rafId = requestAnimationFrame(animate);
  };

  // Start the loop
  rafId = requestAnimationFrame(animate);

  // Return cleanup function
  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
