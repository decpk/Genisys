export interface InsertAnchorOptions {
  afterHeading?: string
  afterText?: string
}

export type InsertContentResult = { content: string } | { error: string }

/** Collapse runs of 3+ newlines so there is never more than one blank line. */
function normalizeBlankLines(content: string): string {
  return content.replace(/\n{3,}/g, '\n\n')
}

/** Markdown heading level (number of leading `#`), or 0 if the line is not a heading. */
function getHeadingLevel(line: string): number {
  const match = line.match(/^(#{1,6})\s+/)
  if (!match) return 0
  return match[1].length
}

/** Heading text with leading `#` chars and surrounding whitespace stripped. */
function getHeadingText(line: string): string {
  return line.replace(/^#+/, '').trim()
}

/**
 * Insert `text` into `content` at a location determined by `options`:
 * after a named heading's section, after a snippet of text, or appended at the end.
 */
export function insertContentAtAnchor(
  content: string,
  text: string,
  options: InsertAnchorOptions,
): InsertContentResult {
  if (options.afterHeading) {
    const target = options.afterHeading.trim().toLowerCase()
    const lines = content.split('\n')

    let headingIndex = -1
    let headingLevel = 0
    for (let i = 0; i < lines.length; i++) {
      const level = getHeadingLevel(lines[i])
      if (level > 0 && getHeadingText(lines[i]).toLowerCase() === target) {
        headingIndex = i
        headingLevel = level
        break
      }
    }

    if (headingIndex === -1) {
      return { error: `Heading "${options.afterHeading}" not found in chapter.` }
    }

    let insertAt = lines.length
    for (let i = headingIndex + 1; i < lines.length; i++) {
      const level = getHeadingLevel(lines[i])
      if (level > 0 && level <= headingLevel) {
        insertAt = i
        break
      }
    }

    const before = lines.slice(0, insertAt).join('\n')
    const after = lines.slice(insertAt).join('\n')

    let result: string
    if (after.trim().length === 0) {
      result = before.trimEnd() + '\n\n' + text + '\n'
    } else {
      result = before.trimEnd() + '\n\n' + text + '\n\n' + after
    }
    return { content: normalizeBlankLines(result) }
  }

  if (options.afterText) {
    const index = content.indexOf(options.afterText)
    if (index === -1) {
      const raw = options.afterText
      const snippet = raw.length > 60 ? raw.slice(0, 60) : raw
      return { error: `Anchor text "${snippet}" not found in chapter.` }
    }
    const insertAt = index + options.afterText.length
    const before = content.slice(0, insertAt)
    const after = content.slice(insertAt)
    const result = before + '\n\n' + text + '\n\n' + after
    return { content: normalizeBlankLines(result) }
  }

  return { content: content.trimEnd() + '\n\n' + text + '\n' }
}
