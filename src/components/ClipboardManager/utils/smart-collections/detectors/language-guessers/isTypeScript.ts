const INTERFACE_PATTERN = /\binterface\s+\w+/
const TYPE_ALIAS_PATTERN = /\btype\s+\w+\s*=/
const TYPE_ANNOTATION = /:\s*(string|number|boolean|void|any|unknown|never)\b/
const AS_CONST = /\bas\s+(const|\w+)\b/
const ENUM_PATTERN = /\benum\s+\w+/
const NAMESPACE_PATTERN = /\bnamespace\s+\w+/
const GENERICS = /<\w+(\s*,\s*\w+)*>/

export function isTypeScript(text: string): boolean {
  if (INTERFACE_PATTERN.test(text)) return true
  if (TYPE_ALIAS_PATTERN.test(text)) return true
  if (TYPE_ANNOTATION.test(text)) return true
  if (AS_CONST.test(text)) return true
  if (ENUM_PATTERN.test(text)) return true
  if (NAMESPACE_PATTERN.test(text)) return true
  if (GENERICS.test(text) && (TYPE_ANNOTATION.test(text) || INTERFACE_PATTERN.test(text))) {
    return true
  }
  return false
}
