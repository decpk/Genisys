import { useCallback } from 'react'

import type { WebpageSource } from '../../book-prompt'
import { crawlWebpageForBook } from '../api/crawlWebpageForBook'
import { extractDomainFromUrl } from '../utils/extractDomainFromUrl'
import { formatByteSize } from '../utils/formatByteSize'
import { isValidWebpageUrl } from '../utils/isValidWebpageUrl'

export interface CrawlSuccess {
  ok: true
  source: WebpageSource
  titleSuggestion: string
  descriptionSuggestion: string
  domain: string
  byteSizeLabel: string
}

export interface CrawlFailure {
  ok: false
  error: string
}

export type CrawlResult = CrawlSuccess | CrawlFailure

export interface WebpageCrawlApi {
  crawl: (url: string) => Promise<CrawlResult>
}

export function useWebpageCrawl(): WebpageCrawlApi {
  const crawl = useCallback(async (url: string): Promise<CrawlResult> => {
    const trimmed = url.trim()
    if (!trimmed) {
      return { ok: false, error: 'Please enter a URL' }
    }
    if (!isValidWebpageUrl(trimmed)) {
      return { ok: false, error: 'Please enter a valid HTTP or HTTPS URL' }
    }

    try {
      const result = await crawlWebpageForBook(trimmed)
      const source: WebpageSource = {
        url: result.url,
        title: result.title,
        description: result.description,
        content: result.content,
      }
      const domain = extractDomainFromUrl(result.url)
      const byteSizeLabel = formatByteSize(result.byteSize)
      return {
        ok: true,
        source,
        titleSuggestion: result.title,
        descriptionSuggestion: result.description,
        domain,
        byteSizeLabel,
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch webpage'
      return { ok: false, error: message || 'Failed to fetch webpage' }
    }
  }, [])

  return { crawl }
}
