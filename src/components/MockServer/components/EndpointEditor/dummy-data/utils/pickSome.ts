/** Returns up to `count` unique random elements from `items` (order randomized). */
export function pickSome<T>(items: readonly T[], count: number): T[] {
  const pool = [...items]
  const result: T[] = []
  const take = Math.min(count, pool.length)
  for (let i = 0; i < take; i++) {
    const index = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(index, 1)[0])
  }
  return result
}
