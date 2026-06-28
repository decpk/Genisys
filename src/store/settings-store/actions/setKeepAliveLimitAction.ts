import { patchAppData } from '../../app-data'

/**
 * Sanitize, persist, and return the next `keepAliveLimit` (keep-alive LRU cap).
 * Returns `null` when the value is unchanged, letting the store thin-wrapper
 * skip a re-render.
 *
 * `0` means "unlimited" (never evict — legacy behavior). Positive values are
 * floored to whole numbers; negative/NaN inputs collapse to `0`.
 */
export function setKeepAliveLimitAction(
  current: number,
  next: number,
): number | null {
  let sanitized = Math.floor(next)
  if (!Number.isFinite(sanitized) || sanitized < 0) sanitized = 0
  if (sanitized === current) return null
  patchAppData((d) => {
    d.settings.keepAliveLimit = sanitized
  })
  return sanitized
}
