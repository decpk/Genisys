const CONSTRUCTOR = /\bnew\s+[A-Z_$][\w$]*\s*\(/

/** True when text invokes a constructor (e.g. `new Date(`, `new Map(`). */
export function hasConstructorCall(text: string): boolean {
  return CONSTRUCTOR.test(text)
}
