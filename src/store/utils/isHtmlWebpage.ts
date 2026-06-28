import type { SavedWebpage } from '../webpage-store.types'

export function isHtmlWebpage(webpage: SavedWebpage): boolean {
  return webpage.filePath.toLowerCase().endsWith('.html')
}
