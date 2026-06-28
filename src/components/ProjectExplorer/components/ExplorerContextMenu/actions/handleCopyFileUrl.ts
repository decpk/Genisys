import { copyToClipboard } from '@/lib/clipboard'

import { getFileUrl } from '../../../utils/getFileUrl'

export function handleCopyFileUrl(rootPath: string, repoRelativePath: string): void {
  const url = getFileUrl(rootPath, repoRelativePath)
  copyToClipboard(url, 'File URL')
}
