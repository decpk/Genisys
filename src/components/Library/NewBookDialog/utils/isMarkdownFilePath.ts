const MARKDOWN_EXTENSIONS = ['md', 'mdx', 'markdown']

/**
 * Returns true if the given file path has a markdown extension.
 * Matches the extensions accepted by `window.api.selectMarkdownFiles`.
 */
export function isMarkdownFilePath(filePath: string): boolean {
  const lastDot = filePath.lastIndexOf('.')
  if (lastDot === -1) return false
  const ext = filePath.slice(lastDot + 1).toLowerCase()
  return MARKDOWN_EXTENSIONS.includes(ext)
}
