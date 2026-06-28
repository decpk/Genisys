import { copyToClipboard } from '@/lib/clipboard'

import { getBaseName } from '../../../utils/getBaseName'

export function handleCopyName(repoRelativePath: string): void {
  const name = getBaseName(repoRelativePath)
  copyToClipboard(name, 'Name')
}
