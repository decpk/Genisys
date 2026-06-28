const METHOD_CALL = /\b\w+\.\w+\(/

/** True when text contains an identifier-dot-identifier-paren pattern (e.g. `console.log(`). */
export function hasMethodCall(text: string): boolean {
  return METHOD_CALL.test(text)
}
