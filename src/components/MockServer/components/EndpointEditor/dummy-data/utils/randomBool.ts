/** Returns a random boolean. `probabilityTrue` is the chance of `true` (0..1). */
export function randomBool(probabilityTrue = 0.5): boolean {
  return Math.random() < probabilityTrue
}
