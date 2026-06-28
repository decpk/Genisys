const SQL_PATTERN = /\b(SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+(TABLE|INDEX|VIEW|DATABASE)|ALTER\s+TABLE|DROP\s+(TABLE|INDEX|VIEW))\b/i

export function isSql(text: string): boolean {
  return SQL_PATTERN.test(text)
}
