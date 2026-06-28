import { revealItemInDir } from '@tauri-apps/plugin-opener'

import { joinRepoPath } from '../../../utils/joinRepoPath'

export async function handleRevealInFinder(rootPath: string, repoRelativePath: string): Promise<void> {
  const fullPath = joinRepoPath(rootPath, repoRelativePath)
  await revealItemInDir(fullPath)
}
