export function getFileUrl(rootPath: string, repoPath: string): string {
  const root = rootPath.replace(/\/+$/, '')
  const repo = repoPath.replace(/^\/+/, '')
  if (repo === '') return `file://${root}`
  const encoded = repo
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `file://${root}/${encoded}`
}
