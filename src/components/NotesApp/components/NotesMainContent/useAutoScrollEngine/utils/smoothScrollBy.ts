/**
 * Smoothly scrolls a container vertically by a pixel delta over a fixed
 * duration using requestAnimationFrame and an ease-in-out curve.
 *
 * Used by the stepped auto-scroll engine to perform each discrete "jump"
 * with a polished animation rather than an instant snap.
 *
 * @param container - The scroll container element
 * @param deltaPx - Pixels to scroll down by (positive) over the duration
 * @param durationMs - Animation duration in milliseconds
 * @param onDone - Optional callback fired once the animation completes
 * @returns Cancel function that aborts the in-flight animation
 */
export function smoothScrollBy(
  container: HTMLDivElement,
  deltaPx: number,
  durationMs: number,
  onDone?: () => void
): () => void {
  const startTop = container.scrollTop;
  const startTime = performance.now();
  let rafId: number | null = null;
  let cancelled = false;

  // easeInOutQuad — gentle acceleration then deceleration.
  const ease = (t: number): number =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  const tick = (now: number) => {
    if (cancelled) return;

    const elapsed = now - startTime;
    const progress = durationMs <= 0 ? 1 : Math.min(elapsed / durationMs, 1);
    container.scrollTop = startTop + deltaPx * ease(progress);

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    rafId = null;
    onDone?.();
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
