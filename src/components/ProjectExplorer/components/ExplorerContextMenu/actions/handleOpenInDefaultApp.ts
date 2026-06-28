import { openPath } from '@tauri-apps/plugin-opener'

import { joinRepoPath } from '../../../utils/joinRepoPath'

export async function handleOpenInDefaultApp(rootPath: string, repoRelativePath: string): Promise<void> {
  const fullPath = joinRepoPath(rootPath, repoRelativePath)
  await openPath(fullPath)
}
