/**
 * Round a floating-point number to a fixed number of decimal places.
 * Avoids drift from repeated additions like 0.1 + 0.1 + 0.1 = 0.30000000000000004.
 */
export function roundToDecimals(value: number, decimals: number): number {
  if (decimals <= 0) return Math.round(value)
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
