/**
 * Formats a step wait interval (ms) for display in seconds.
 * Examples: 3000 -> "3s", 2500 -> "2.5s"
 *
 * @param intervalMs - Wait interval between steps, in milliseconds
 * @returns Formatted string (e.g. "3s", "2.5s")
 */
export function formatStepInterval(intervalMs: number): string {
  const seconds = intervalMs / 1000;
  const rounded = Math.round(seconds * 10) / 10;
  return `${rounded}s`;
}
