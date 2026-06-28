/**
 * Formats the countdown's remaining time for display.
 * Examples: 12000 -> "12", 3400 -> "3.4", 900 -> "0.9"
 *
 * Whole seconds for >= 10s (compact), one decimal below that so short
 * intervals still visibly tick down.
 *
 * @param remainingMs - Remaining time until the next step (ms)
 * @returns Formatted seconds string (without unit)
 */
export function formatCountdown(remainingMs: number): string {
  const clamped = Math.max(0, remainingMs);
  const seconds = clamped / 1000;

  if (seconds >= 10) {
    return `${Math.ceil(seconds)}`;
  }

  return (Math.ceil(seconds * 10) / 10).toFixed(1);
}
