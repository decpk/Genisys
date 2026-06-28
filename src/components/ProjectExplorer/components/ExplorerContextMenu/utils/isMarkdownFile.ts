const MD_EXTENSIONS = ['.md', '.mdx', '.markdown']

export function isMarkdownFile(filePath: string): boolean {
  const lower = filePath.toLowerCase()
  return MD_EXTENSIONS.some((ext) => lower.endsWith(ext))
}
