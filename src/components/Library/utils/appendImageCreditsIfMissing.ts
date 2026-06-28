/**
 * Append `## Image Credits` to the chapter markdown if it isn't already
 * present. Returns `markdown` unchanged when there is nothing to add.
 *
 * The check is intentionally case-insensitive but otherwise strict — the AI
 * sometimes emits "## Image credits" or "## Image Credit". Either variant
 * counts as already-present so we don't append twice.
 */
export function appendImageCreditsIfMissing(
  markdown: string,
  creditsBlock: string,
): string {
  if (!creditsBlock) return markdown
  if (/^##\s+image\s+credits?/im.test(markdown)) return markdown
  const trimmed = markdown.replace(/\s+$/, '')
  return `${trimmed}\n\n${creditsBlock}`
}
