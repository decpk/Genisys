/**
 * Formats a step pixel distance for display.
 * Example: 300 -> "300px"
 *
 * @param pixels - Pixel distance per step
 * @returns Formatted string (e.g. "300px")
 */
export function formatStepPixels(pixels: number): string {
  return `${Math.round(pixels)}px`;
}
