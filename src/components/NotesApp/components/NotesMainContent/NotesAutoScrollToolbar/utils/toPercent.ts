/**
 * Computes the position (0–100%) of a value within a [min, max] range.
 * Used to place slider tick marks proportionally along the track.
 *
 * @param value - Value within the range
 * @param min - Range minimum
 * @param max - Range maximum
 * @returns Percentage position (0–100)
 */
export function toPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}
