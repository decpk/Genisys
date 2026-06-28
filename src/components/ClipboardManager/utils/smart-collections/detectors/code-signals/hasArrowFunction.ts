const ARROW_FN = /\([^)]*\)\s*=>|\b\w+\s*=>/

/** True when text contains an arrow function (e.g. `() =>`, `x => x + 1`). */
export function hasArrowFunction(text: string): boolean {
  return ARROW_FN.test(text)
}
