import { useCallback, useRef } from 'react'

import { useNewsTileStore, generateArticleId } from '@/store/news-tile-store'
import type { NewsArticle, NewsInterest } from '@/store/news-tile-store'
import { getCategoryEntry } from '../news-categories'
import { parseJSON } from '@/lib/parse-json'
import { URL_RESOLVE_SYSTEM } from '@/prompts/dashboardNewsUrlResolveSystemPrompt'
import { PARSE_ARTICLES_SYSTEM } from '@/prompts/dashboardNewsParseArticlesSystemPrompt'
import { AI_NEWS_SYSTEM } from '@/prompts/dashboardNewsTopNewsSystemPrompt'
import { ARTICLE_CLEAN_SYSTEM } from '@/prompts/dashboardNewsArticleCleanSystemPrompt'
import { ARTICLE_GENERATE_SYSTEM } from '@/prompts/dashboardNewsArticleGenerateSystemPrompt'

// ── Hash helper ──────────────────────────────────────────────────

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  return Math.abs(hash).toString(36)
}

function articleHash(title: string, url: string): string {
  const normalized = `${title.toLowerCase().trim()}|${url.toLowerCase().trim()}`
  return simpleHash(normalized)
}

// ── Hook ─────────────────────────────────────────────────────────

interface UseNewsFetchReturn {
  fetchForInterest: (interest: NewsInterest, force?: boolean) => Promise<void>
  refreshAll: () => Promise<void>
  fetchArticleBody: (article: NewsArticle) => Promise<{ markdown: string; image?: string | null; author?: string | null; publishedAt?: string | null } | null>
}

export function useNewsFetch(): UseNewsFetchReturn {
  const interests = useNewsTileStore((s) => s.interests)
  const setInterestLoading = useNewsTileStore((s) => s.setInterestLoading)
  const setArticlesForInterest = useNewsTileStore((s) => s.setArticlesForInterest)
  const setResolvedUrl = useNewsTileStore((s) => s.setResolvedUrl)
  const setInterestRefreshedAt = useNewsTileStore((s) => s.setInterestRefreshedAt)
  const loadLikedArticles = useNewsTileStore((s) => s.loadLikedArticles)
  const setArticleExtras = useNewsTileStore((s) => s.setArticleExtras)
  const inflightRef = useRef<Set<string>>(new Set())
  const bodyInflightRef = useRef<Map<string, Promise<{ markdown: string; image?: string | null; author?: string | null; publishedAt?: string | null } | null>>>(new Map())

  const fetchForInterest = useCallback(
    async (interest: NewsInterest, force = false) => {
      // Check if already in-flight
      if (inflightRef.current.has(interest.id)) return
      // Skip if refreshed within 24h and not forced
      if (!force && interest.lastRefreshedAt) {
        const lastRefresh = new Date(interest.lastRefreshedAt).getTime()
        if (Date.now() - lastRefresh < 86_400_000) return
      }

      inflightRef.current.add(interest.id)
      setInterestLoading(interest.id, true)

      try {
        const category = getCategoryEntry(interest.categoryKey)
        const topicDesc = interest.customPrompt
          ? `${interest.label}: ${interest.customPrompt}`
          : interest.label

        // Step 1: Resolve source URL (if not cached)
        let sourceUrl = interest.resolvedUrl
        if (!sourceUrl || force) {
          const urlResult = await window.api.llmJsonCompletion({
            systemPrompt: URL_RESOLVE_SYSTEM,
            userPrompt: `Category: ${interest.label}\nTopic: ${topicDesc}\nPreferred sources: ${category.defaultSourceHint}\n\nReturn the best news source URL.`,
          })
          if (urlResult.success && urlResult.content) {
            try {
              const parsed = JSON.parse(urlResult.content)
              if (parsed.url) {
                sourceUrl = parsed.url
                setResolvedUrl(interest.id, sourceUrl!)
              }
            } catch { /* ignore parse errors */ }
          }
        }

        // Parallel fetch: URL-parsed articles + AI-generated articles
        const [urlArticles, aiArticles] = await Promise.all([
          // Step 2: Crawl + parse URL articles
          sourceUrl
            ? (async () => {
                try {
                  const crawl = await window.api.crawlWebpageLite(sourceUrl!)
                  if (!crawl.success || !crawl.content) return []
                  const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  const parseResult = await window.api.llmJsonCompletion({
                    systemPrompt: PARSE_ARTICLES_SYSTEM,
                    userPrompt: `Today's date: ${todayStr}\nSource URL: ${sourceUrl}\nPage title: ${crawl.title ?? ''}\n\nPage content:\n${(crawl.content ?? '').slice(0, 15000)}`,
                  })
                  if (parseResult.success && parseResult.content) {
                    const parsed = JSON.parse(parseResult.content)
                    return Array.isArray(parsed) ? parsed.slice(0, 5) : []
                  }
                  return []
                } catch {
                  return []
                }
              })()
            : Promise.resolve([]),

          // Step 3: AI-generated top news
          (async () => {
            try {
              const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              const aiResult = await window.api.llmJsonCompletion({
                systemPrompt: AI_NEWS_SYSTEM,
                userPrompt: `Today's date: ${today}\nTopic: ${topicDesc}\n\nProvide the top 5 latest news items about this topic.`,
              })
              if (aiResult.success && aiResult.content) {
                const parsed = JSON.parse(aiResult.content)
                return Array.isArray(parsed) ? parsed.slice(0, 5) : []
              }
              return []
            } catch {
              return []
            }
          })(),
        ])

        // Step 4: Dedupe and merge
        const now = new Date().toISOString()
        const seenHashes = new Set<string>()
        const merged: NewsArticle[] = []

        const addArticle = (
          raw: any,
          sourceType: 'url' | 'ai',
        ) => {
          if (!raw.title || !raw.url) return
          const hash = articleHash(raw.title, raw.url)
          if (seenHashes.has(hash)) return
          seenHashes.add(hash)
          merged.push({
            id: generateArticleId(),
            interestId: interest.id,
            sourceType,
            title: raw.title ?? '',
            summary: raw.summary ?? '',
            url: raw.url ?? '',
            sourceName: raw.sourceName ?? '',
            author: raw.author ?? '',
            publishedAt: raw.publishedAt ?? null,
            fetchedAt: now,
            isLiked: false,
            likedAt: null,
            rawHash: hash,
            extrasJson: '{}',
          })
        }

        // Interleave: url first, then ai, capped at 10
        for (const a of urlArticles) addArticle(a, 'url')
        for (const a of aiArticles) addArticle(a, 'ai')
        const final = merged.slice(0, 10)

        setArticlesForInterest(interest.id, final)
        setInterestRefreshedAt(interest.id, now)
        await loadLikedArticles()
      } catch (e) {
        console.error(`[useNewsFetch] error for ${interest.id}:`, e)
      } finally {
        inflightRef.current.delete(interest.id)
        setInterestLoading(interest.id, false)
      }
    },
    [setInterestLoading, setArticlesForInterest, setResolvedUrl, setInterestRefreshedAt, loadLikedArticles],
  )

  const refreshAll = useCallback(async () => {
    await Promise.all(interests.map((i) => fetchForInterest(i, true)))
  }, [interests, fetchForInterest])

  const fetchArticleBody = useCallback(
    (article: NewsArticle): Promise<{ markdown: string; image?: string | null; author?: string | null; publishedAt?: string | null } | null> => {
      // Check cache
      try {
        const extras = JSON.parse(article.extrasJson || '{}')
        if (extras.fullContent?.markdown) return Promise.resolve(extras.fullContent)
      } catch { /* ignore */ }

      // Dedupe inflight — return the existing promise if one is already running
      const existing = bodyInflightRef.current.get(article.id)
      if (existing) return existing

      const promise = (async (): Promise<{ markdown: string; image?: string | null; author?: string | null; publishedAt?: string | null } | null> => {
        let pageContent: string | null = null

        // Try crawling the article URL
        const crawl = await window.api.crawlWebpageLite(article.url)
        if (crawl.success && crawl.content) {
          pageContent = crawl.content
        }

        let parsed: { markdown?: string; image?: string | null; author?: string | null; publishedAt?: string | null }

        if (pageContent) {
          // Extract article from crawled page content
          const result = await window.api.llmJsonCompletion({
            systemPrompt: ARTICLE_CLEAN_SYSTEM,
            userPrompt: `Article URL: ${article.url}\nArticle title: ${article.title}\n\nPage content:\n${pageContent.slice(0, 20000)}`,
          })

          if (!result.success || !result.content) {
            throw new Error('Article extraction model returned no content')
          }

          parsed = parseJSON(result.content)
        } else {
          // Crawl failed — generate a rich article from title + summary
          const result = await window.api.llmJsonCompletion({
            systemPrompt: ARTICLE_GENERATE_SYSTEM,
            userPrompt: `Article title: ${article.title}\nSource: ${article.sourceName}\nAuthor: ${article.author || 'Unknown'}\n\nSummary:\n${article.summary}\n\nWrite a full-length, deeply engaging feature article based on this.`,
          })

          if (!result.success || !result.content) {
            throw new Error('Could not generate article content')
          }

          parsed = parseJSON(result.content)
        }

        if (!parsed.markdown) {
          throw new Error('Extracted content was empty')
        }

        const body = {
          markdown: parsed.markdown,
          image: parsed.image ?? null,
          author: parsed.author ?? article.author ?? null,
          publishedAt: parsed.publishedAt ?? article.publishedAt ?? null,
          fetchedAt: new Date().toISOString(),
        }

        // Persist into extrasJson
        let existingExtras: Record<string, unknown> = {}
        try { existingExtras = JSON.parse(article.extrasJson || '{}') } catch { /* ignore */ }
        const newExtras = { ...existingExtras, fullContent: body, image: body.image ?? existingExtras.image }
        setArticleExtras(article.id, newExtras)

        return body
      })()
        .catch((e) => {
          console.error(`[useNewsFetch] fetchArticleBody error for ${article.id}:`, e)
          throw e
        })
        .finally(() => {
          bodyInflightRef.current.delete(article.id)
        })

      bodyInflightRef.current.set(article.id, promise)
      return promise
    },
    [setArticleExtras],
  )

  return { fetchForInterest, refreshAll, fetchArticleBody }
}
