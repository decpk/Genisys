const DEF_PATTERN = /^\s*def\s+\w+\s*\(/m
const CLASS_PATTERN = /^\s*class\s+\w+\s*[:(]/m
const IMPORT_PATTERN = /^\s*(import\s+\w+|from\s+\w+\s+import)/m
const MAIN_PATTERN = /^\s*if\s+__name__\s*==\s*['"]__main__['"]/m
const PRINT_PATTERN = /\bprint\s*\(/
const DECORATOR_PATTERN = /^\s*@\w+\s*\n\s*def\s+/m
const SEMICOLON_LINE = /;\s*$/

export function isPython(text: string): boolean {
  const semiTerminatedLines = text
    .split('\n')
    .filter((line) => SEMICOLON_LINE.test(line.trim())).length
  if (semiTerminatedLines > 3) return false

  let matches = 0
  if (DEF_PATTERN.test(text)) matches++
  if (CLASS_PATTERN.test(text)) matches++
  if (IMPORT_PATTERN.test(text)) matches++
  if (MAIN_PATTERN.test(text)) matches++
  if (PRINT_PATTERN.test(text)) matches++
  if (DECORATOR_PATTERN.test(text)) matches++

  return matches >= 2
}
