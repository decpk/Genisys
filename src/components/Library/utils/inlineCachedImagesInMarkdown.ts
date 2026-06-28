import { parseLibraryImageUri } from './parseLibraryImageUri'

/**
 * Walk a chapter's markdown, find every `library-image://...` reference,
 * and replace each one with an inline `data:` URL that embeds the cached
 * image bytes. Used by export pipelines (HTML, PDF, EPUB) so the
 * resulting file is fully self-contained and viewable offline without
 * Tauri.
 *
 * Images that fail to load (e.g. cache was cleared, file deleted) are
 * left as-is; the consumer can render its standard "image not available"
 * fallback for them.
 */
export async function inlineCachedImagesInMarkdown(markdown: string): Promise<string> {
  if (!markdown) return markdown
  if (!markdown.includes('library-image')) return markdown

  // Collect unique library-image URLs first so we issue one Tauri command
  // per *unique* image, even when the same image appears multiple times.
  const referenced = new Set<string>()
  const urlRegex = /(library-image:\/\/[^\s)"'`]+|https?:\/\/library-image\.localhost\/[^\s)"'`]+)/g
  for (const match of markdown.matchAll(urlRegex)) {
    referenced.add(match[1])
  }

  if (referenced.size === 0) return markdown

  const replacements = new Map<string, string>()
  await Promise.all(
    Array.from(referenced).map(async (url) => {
      const parsed = parseLibraryImageUri(url)
      if (!parsed) return
      try {
        const dataUrl = await window.api.loadCachedImageAsDataUrl(
          parsed.bookId,
          parsed.filename,
        )
        if (dataUrl) replacements.set(url, dataUrl)
      } catch (err) {
        console.warn('[inlineCachedImages] failed to inline', url, err)
      }
    }),
  )

  if (replacements.size === 0) return markdown

  return markdown.replace(urlRegex, (match) => replacements.get(match) ?? match)
}
