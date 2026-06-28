/**
 * Single-flight registry for deduping concurrent async calls keyed by string.
 * If a call is in-flight for `key`, subsequent callers share the same Promise.
 * On settle (success or error), the entry is cleared.
 */

const inFlightCalls = new Map<string, Promise<unknown>>()

export async function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlightCalls.get(key)
  if (existing) return existing as Promise<T>

  const promise = fn().finally(() => {
    if (inFlightCalls.get(key) === promise) inFlightCalls.delete(key)
  })

  inFlightCalls.set(key, promise as Promise<unknown>)
  return promise
}

/**
 * Drop the in-flight entry for a key so the next caller starts fresh.
 * Does not abort the underlying Promise.
 */
export function cancelInFlight(key: string): void {
  inFlightCalls.delete(key)
}
