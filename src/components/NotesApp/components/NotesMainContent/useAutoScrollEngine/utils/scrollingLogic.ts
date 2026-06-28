/**
 * Core auto-scroll scrolling logic
 * Handles smooth scrolling using requestAnimationFrame.
 */

/**
 * Maximum delta time (seconds) honoured for a single frame.
 *
 * requestAnimationFrame does not fire at a perfectly even cadence: when the tab
 * is briefly busy (autosave, an editor re-render, GC, etc.) one or more frames
 * get dropped and the next callback arrives with a large gap. Without a cap, the
 * scroll would lurch forward by that whole gap in one step, which reads as a
 * visible "jerk". Clamping the delta keeps each step small and even so motion
 * stays smooth (we simply move slightly slower across a stutter instead of
 * teleporting).
 */
const MAX_FRAME_DELTA_SECONDS = 1 / 30; // ~33ms (never jump more than ~2 frames)

/**
 * Performs one scroll step using requestAnimationFrame.
 * Scrolls the container down by pxPerSecond per frame (using deltaTime).
 *
 * @param container - The scroll container element
 * @param pxPerSecond - Pixels to scroll per second
 * @param currentTime - Current timestamp for deltaTime calculation
 * @param lastScrollTime - Last scroll time (to calculate deltaTime)
 * @returns New timestamp for next frame
 */
export function scrollStep(
  container: HTMLDivElement,
  pxPerSecond: number,
  currentTime: number,
  lastScrollTime: number,
  accumulatedScrollTop: number
): { timestamp: number; scrollTop: number } {
  // Clamp the frame delta so a dropped/stuttered frame can't produce a large
  // jump. This is the key to jerk-free motion under load.
  const rawDeltaSeconds = (currentTime - lastScrollTime) / 1000;
  const deltaTimeSeconds = Math.min(Math.max(rawDeltaSeconds, 0), MAX_FRAME_DELTA_SECONDS);
  const pxToScroll = pxPerSecond * deltaTimeSeconds;

  // Accumulate position as a float so sub-pixel deltas (e.g. 0.5px/frame at slow
  // speeds) aren't lost to scrollTop's integer rounding on read-back.
  const nextScrollTop = accumulatedScrollTop + pxToScroll;
  container.scrollTop = nextScrollTop;

  return { timestamp: currentTime, scrollTop: nextScrollTop };
}

/**
 * Checks if scroll container is at or near the bottom.
 * "Near bottom" is within 10px to account for rounding/subpixel rendering.
 *
 * @param container - The scroll container element
 * @returns true if at/near bottom
 */
export function isNearScrollBottom(container: HTMLDivElement): boolean {
  const tolerance = 10; // pixels
  const scrollableHeight = container.scrollHeight - container.clientHeight;
  return container.scrollTop >= scrollableHeight - tolerance;
}

/**
 * Resets scroll position to top (for UI state consistency).
 *
 * @param container - The scroll container element
 */
export function resetScroll(container: HTMLDivElement): void {
  container.scrollTop = 0;
}
