import { randomInt } from './randomInt'

/** Returns one random element from a non-empty array. */
export function pickOne<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]
}
