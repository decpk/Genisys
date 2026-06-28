import { copyToClipboard } from '@/lib/clipboard'

import { getMarkdownLink } from '../../../utils/getMarkdownLink'

export function handleCopyMarkdownLink(name: string, repoRelativePath: string): void {
  const link = getMarkdownLink(name, repoRelativePath)
  copyToClipboard(link, 'Markdown link')
}
