import { copyToClipboard } from '@/lib/clipboard'

export function handleCopyRelativePath(repoRelativePath: string): void {
  copyToClipboard(repoRelativePath, 'Relative path')
}
