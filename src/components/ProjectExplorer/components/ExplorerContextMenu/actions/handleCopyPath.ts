import { copyToClipboard } from '@/lib/clipboard'

import { joinRepoPath } from '../../../utils/joinRepoPath'

export function handleCopyPath(rootPath: string, repoRelativePath: string): void {
  const fullPath = joinRepoPath(rootPath, repoRelativePath)
  copyToClipboard(fullPath, 'Full path')
}
