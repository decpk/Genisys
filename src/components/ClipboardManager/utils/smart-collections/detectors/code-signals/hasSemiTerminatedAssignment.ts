const ASSIGNMENT_TERMINATED = /\b[\w.]+\s*=[^=].*;\s*$/m

/**
 * True when text contains an assignment that ends with a semicolon
 * (e.g. `const x = 5;` or `foo.bar = 'baz';`).
 */
export function hasSemiTerminatedAssignment(text: string): boolean {
  return ASSIGNMENT_TERMINATED.test(text)
}
