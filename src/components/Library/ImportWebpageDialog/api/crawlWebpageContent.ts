export interface CrawledWebpageContent {
  url: string
  title: string
  content: string
}

export async function crawlWebpageContent(
  url: string,
): Promise<CrawledWebpageContent> {
  const result = await window.api.crawlWebpage(url)
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch webpage')
  }
  const content = result.content ?? ''
  if (!content.trim()) {
    throw new Error('The page returned no readable content. Try a different URL.')
  }
  return {
    url: result.url ?? url,
    title: result.title ?? '',
    content,
  }
}
