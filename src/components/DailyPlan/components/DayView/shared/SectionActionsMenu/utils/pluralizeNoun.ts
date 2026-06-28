/** Return the plural or singular form of a noun based on count. */
export function pluralizeNoun(noun: string, count: number): string {
  return count === 1 ? noun : noun + 's'
}
