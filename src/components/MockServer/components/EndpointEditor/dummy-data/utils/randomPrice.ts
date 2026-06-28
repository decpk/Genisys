/** Returns a random price between `min` and `max`, rounded to 2 decimals. */
export function randomPrice(min: number, max: number): number {
  const value = Math.random() * (max - min) + min
  return Math.round(value * 100) / 100
}
