import { memo, useEffect, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ExternalLink, Heart, Globe, Sparkles, RotateCcw } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import { AppLoader } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { relativeTime } from '@/lib/format'
import type { NewsArticle } from '@/store/news-tile-store'

interface ArticleReaderProps {
  article: NewsArticle
  onBack: () => void
  onToggleLike: (articleId: string) => void
  fetchArticleBody: (article: NewsArticle) => Promise<{ markdown: string; image?: string | null; author?: string | null; publishedAt?: string | null } | null>
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

export const ArticleReader = memo(function ArticleReader({
  article,
  onBack,
  onToggleLike,
  fetchArticleBody,
}: ArticleReaderProps): React.JSX.Element {
  const [body, setBody] = useState<{ markdown: string; image?: string | null; author?: string | null; publishedAt?: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const domain = getDomain(article.url)

  const doFetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Check if already cached in extrasJson
      try {
        const extras = JSON.parse(article.extrasJson || '{}')
        if (extras.fullContent?.markdown) {
          setBody(extras.fullContent)
          setLoading(false)
          return
        }
      } catch { /* ignore */ }

      const result = await fetchArticleBody(article)
      if (result) {
        setBody(result)
      } else {
        setError('Could not load full article.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load full article.')
    } finally {
      setLoading(false)
    }
  }, [article, fetchArticleBody])

  useEffect(() => {
    doFetch()
  }, [doFetch])

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 shrink-0">
        <Tooltip content="Back to list" side="bottom">
          <IconButton
            onClick={onBack}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft size={14} />
          </IconButton>
        </Tooltip>

        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {domain && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/60 text-muted-foreground shrink-0">
              <Globe size={8} />
              {domain}
            </span>
          )}
          {article.sourceType === 'ai' && (
            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
              <Sparkles size={8} />
              AI
            </span>
          )}
          {(body?.publishedAt ?? article.publishedAt) && (
            <span className="text-[10px] text-muted-foreground/50 shrink-0">
              {relativeTime((body?.publishedAt ?? article.publishedAt)!)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip content={article.isLiked ? 'Unlike' : 'Like'} side="bottom">
            <IconButton
              onClick={() => onToggleLike(article.id)}
              variant="ghost"
              size="sm"
              className="active:scale-90"
            >
              <Heart
                size={13}
                className={
                  article.isLiked
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-muted-foreground/50 hover:text-rose-400'
                }
              />
            </IconButton>
          </Tooltip>
          <Tooltip content="Open in browser" side="bottom">
            <IconButton
              onClick={() => openUrl(article.url)}
              variant="ghost"
              size="sm"
            >
              <ExternalLink size={13} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3">
        {/* Title always shown */}
        <h2 className="text-sm font-semibold leading-snug text-foreground mb-1">
          {article.title}
        </h2>
        {(body?.author ?? article.author) && (
          <p className="text-[11px] text-muted-foreground/60 mb-3">
            by {body?.author ?? article.author}
          </p>
        )}

        {loading && (
          <div className="min-h-[160px] flex items-center justify-center">
            <AppLoader size={24} text="Loading full article…" fullScreen={false} />
          </div>
        )}

        {error && !loading && (
          <div className="min-h-[160px] flex flex-col items-center justify-center py-8 gap-2 text-center">
            <p className="text-xs text-muted-foreground">Could not load full article.</p>
            <p className="text-[10px] text-muted-foreground/50 max-w-[260px]">{error}</p>
            <div className="flex items-center gap-2 mt-1">
              <Button
                onClick={doFetch}
                variant="link"
                size="xs"
              >
                <RotateCcw size={11} />
                Retry
              </Button>
              <Button
                onClick={() => openUrl(article.url)}
                variant="link"
                size="xs"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink size={11} />
                Open original
              </Button>
            </div>
            {/* Show summary as fallback */}
            {article.summary && (
              <p className="text-xs text-muted-foreground mt-4 text-left max-w-full leading-relaxed">
                {article.summary}
              </p>
            )}
          </div>
        )}

        {body && !loading && (
          <div className="news-article-prose text-xs leading-relaxed text-foreground/90">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {body.markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
})
