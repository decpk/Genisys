const HEADING_PATTERN = /^#{1,6}\s+\S/m
const CODE_FENCE_PATTERN = /```/
const LINK_PATTERN = /\[[^\]]+\]\([^)]+\)/
const LIST_PATTERN = /^\s*[-*+]\s+\S/m
const EMPHASIS_PATTERN = /\*\*[^*]+\*\*|__[^_]+__/

export function isMarkdown(text: string): boolean {
  let matches = 0
  if (HEADING_PATTERN.test(text)) matches++
  if (CODE_FENCE_PATTERN.test(text)) matches++
  if (LINK_PATTERN.test(text)) matches++
  if (LIST_PATTERN.test(text)) matches++
  if (EMPHASIS_PATTERN.test(text)) matches++
  return matches >= 2
}
