import { appendImageCreditsIfMissing } from './appendImageCreditsIfMissing'
import { buildImageCreditsBlock } from './buildImageCreditsBlock'
import { extractImageUrls } from './extractImageUrls'
import { rewriteImageUrls } from './rewriteImageUrls'

/**
 * Post-generation hook: download every external image referenced by the
 * chapter's markdown, rewrite the markdown to point at the offline cache,
 * append a `## Image Credits` section, and persist the rewritten markdown
 * back to the chapter row.
 *
 * Designed to be fire-and-forget — failures are logged and swallowed so a
 * cache miss never blocks chapter generation. Returns the rewritten markdown
 * (or the original on failure) so callers that care can re-render eagerly.
 *
 * @param params.bookId - parent book id (used as cache namespace)
 * @param params.chapterId - chapter row id
 * @param params.markdown - the raw markdown the AI just emitted
 * @param params.persist - called with the rewritten markdown when caching
 *                         succeeds and the markdown actually changed. Skipped
 *                         when there are no images or the cache step fails.
 * @param params.enabled - master kill-switch (settings toggle). When false,
 *                         the function is a no-op and returns `markdown`.
 */
export async function cacheChapterImagesAfterGeneration(params: {
  bookId: string
  chapterId: string
  markdown: string
  enabled: boolean
  persist: (rewrittenMarkdown: string) => Promise<void> | void
}): Promise<string> {
  const { bookId, chapterId, markdown, enabled, persist } = params

  if (!enabled) return markdown
  if (!markdown) return markdown
  if (extractImageUrls(markdown).length === 0) return markdown

  try {
    const api = (window as unknown as { api?: { cacheChapterImages?: (b: string, c: string, m: string) => Promise<{ images: any[] }> } }).api
    if (!api?.cacheChapterImages) return markdown

    const result = await api.cacheChapterImages(bookId, chapterId, markdown)
    const records = result?.images ?? []
    if (records.length === 0) return markdown

    const rewritten = rewriteImageUrls(markdown, records)
    const credits = buildImageCreditsBlock(records)
    const withCredits = appendImageCreditsIfMissing(rewritten, credits)

    if (withCredits !== markdown) {
      await persist(withCredits)
    }
    return withCredits
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[library] cacheChapterImagesAfterGeneration failed', err)
    return markdown
  }
}
