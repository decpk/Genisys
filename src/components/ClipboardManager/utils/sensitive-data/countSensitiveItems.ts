import type { ClipboardItem } from '@/store/clipboard-store'
import { analyzeSensitivity } from './analyzeSensitivity'

export function countSensitiveItems(items: ClipboardItem[]): number {
  let count = 0
  for (const item of items) {
    if (item.contentType !== 'text' || !item.textContent) continue
    const level = item.sensitivityLevel ?? analyzeSensitivity(item.textContent).level
    if (level !== 'none') count++
  }
  return count
}
