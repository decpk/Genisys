export interface CrawledWebpageForBook {
  url: string
  title: string
  description: string
  content: string
  byteSize: number
}

export async function crawlWebpageForBook(url: string): Promise<CrawledWebpageForBook> {
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
    description: result.description ?? '',
    content,
    byteSize: new Blob([content]).size,
  }
}
