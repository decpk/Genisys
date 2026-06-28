const TYPE_ANNOT = /:\s*(string|number|boolean|void|any|unknown|never)\b/

/** True when text contains a TypeScript-style primitive type annotation. */
export function hasTypeAnnotation(text: string): boolean {
  return TYPE_ANNOT.test(text)
}
