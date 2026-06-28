const CODE_KEYWORDS = /\b(function|const|let|var|import|export|class|interface|type|return|if|else|for|while|switch|case|try|catch|async|await|def|fn|pub|struct|enum|impl|package|public|private|static|void|int|string|bool|float|println|fmt\.)\b/
const CODE_PATTERNS = /[{};]\s*$|^\s*(\/\/|#!|\/\*|\*\/)|=>\s*[{(]|\(\)\s*[{=]|<\w+>|::\w+|\.\w+\(|^\s*@\w+/m
const BRACKET_HEAVY = /[{}()[\]]{3,}/

export function detectCode(text: string): boolean {
  if (text.length < 10) return false
  const lines = text.split('\n')
  if (lines.length < 2) {
    return CODE_KEYWORDS.test(text) && CODE_PATTERNS.test(text)
  }
  const keywordMatch = CODE_KEYWORDS.test(text)
  const patternMatch = CODE_PATTERNS.test(text)
  const bracketMatch = BRACKET_HEAVY.test(text)
  return (keywordMatch && patternMatch) || (keywordMatch && bracketMatch) || (patternMatch && bracketMatch)
}
