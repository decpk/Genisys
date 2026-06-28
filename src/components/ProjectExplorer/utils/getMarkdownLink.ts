export function getMarkdownLink(name: string, repoPath: string): string {
  const trimmed = repoPath.replace(/^\/+/, '')
  const escaped = trimmed.replace(/\(/g, '%28').replace(/\)/g, '%29')
  return `[${name}](${escaped})`
}
