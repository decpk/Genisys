export function joinRepoPath(rootPath: string, repoRelativePath: string): string {
  const cleanRoot = rootPath.replace(/\/+$/, '')
  const cleanPath = repoRelativePath.replace(/^\/+/, '')
  if (!cleanPath) return cleanRoot
  return `${cleanRoot}/${cleanPath}`
}
