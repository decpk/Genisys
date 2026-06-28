const DEBOUNCE_MS = 1500

let lastPlayedAt = 0

/**
 * Returns true if a chime was played within the debounce window (1.5s) and
 * should be skipped. Otherwise records `now` as the last play time and
 * returns false (caller should proceed with playback).
 */
export function isChimeDebounced(now: number = Date.now()): boolean {
  if (now - lastPlayedAt < DEBOUNCE_MS) return true
  lastPlayedAt = now
  return false
}
