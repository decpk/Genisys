import type { SavedPreview } from '@/components/WebLinks/WebLinks.types'

/**
 * Collect the openable URLs of every saved preview filed under `folderId`,
 * preferring the post-redirect `finalUrl`. Order is preserved and duplicates
 * are removed (first occurrence wins).
 */
export function selectFolderPreviewUrls(previews: SavedPreview[], folderId: string): string[] {
  const urls: string[] = []
  const seen = new Set<string>()

  for (const preview of previews) {
    if (preview.folderId !== folderId) continue
    const url = preview.finalUrl || preview.url
    if (!url || seen.has(url)) continue
    seen.add(url)
    urls.push(url)
  }

  return urls
}
