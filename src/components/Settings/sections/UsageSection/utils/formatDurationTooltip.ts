import { formatDurationMs } from './formatDurationMs'

type RechartsValue = number | string | ReadonlyArray<number | string> | undefined

/**
 * Recharts tooltip/axis formatter for millisecond durations. Recharts'
 * formatter passes `ValueType | undefined` (number, string, or array);
 * we coerce the first numeric value and format it.
 */
export function formatDurationTooltip(value: RechartsValue): string {
  if (value == null) return formatDurationMs(0)
  const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
  return formatDurationMs(numeric)
}
