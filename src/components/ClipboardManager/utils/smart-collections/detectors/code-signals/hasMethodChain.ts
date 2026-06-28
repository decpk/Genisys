const METHOD_CHAIN = /[)\]]\.\w+\(/

/** True when text chains a method off a paren or bracket (e.g. `).toString(`). */
export function hasMethodChain(text: string): boolean {
  return METHOD_CHAIN.test(text)
}
