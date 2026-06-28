export function hasAIBookFormat(md: string): boolean {
  return md.includes('===CHAPTER_START===')
}
