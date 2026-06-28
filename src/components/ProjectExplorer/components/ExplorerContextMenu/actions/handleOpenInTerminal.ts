import { joinRepoPath } from '../../../utils/joinRepoPath'

export async function handleOpenInTerminal(rootPath: string, repoRelativePath: string): Promise<void> {
  const fullPath = joinRepoPath(rootPath, repoRelativePath)
  await window.api.openInTerminal(fullPath)
}
