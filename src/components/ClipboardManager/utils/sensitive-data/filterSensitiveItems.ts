import type { ClipboardItem } from '@/store/clipboard-store'
import { analyzeSensitivity } from './analyzeSensitivity'

export function filterSensitiveItems(items: ClipboardItem[]): ClipboardItem[] {
  return items.filter((item) => {
    if (item.contentType !== 'text' || !item.textContent) return false
    const level = item.sensitivityLevel ?? analyzeSensitivity(item.textContent).level
    return level !== 'none'
  })
}
