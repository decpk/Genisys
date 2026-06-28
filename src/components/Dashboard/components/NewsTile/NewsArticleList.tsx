import { memo, useMemo } from 'react'
import { ExternalLink, Heart, Sparkles, Globe } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import { AppLoader } from '@/components/AppLoader'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { relativeTime } from '@/lib/format'
import type { NewsArticle } from '@/store/news-tile-store'
import { sortNewsArticlesByRecency } from './utils/sortNewsArticlesByRecency'

interface NewsArticleListProps {
  articles: NewsArticle[]
  isLoading: boolean
  onToggleLike: (articleId: string) => void
  onOpenArticle?: (articleId: string) => void
  emptyMessage?: string
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

export const NewsArticleList = memo(function NewsArticleList({
  articles,
  isLoading,
  onToggleLike,
  onOpenArticle,
  emptyMessage = 'No articles yet. Hit refresh to fetch the latest.',
}: NewsArticleListProps): React.JSX.Element {
  // Always render newest-first. Mirrors the SQL ORDER BY in load_news_articles_db
  // so display order is identical whether `articles` came from a fresh fetch
  // (interleaved url-then-ai) or from a DB reload.
  const sortedArticles = useMemo(() => sortNewsArticlesByRecency(articles), [articles])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <AppLoader size={24} text="Loading articles…" fullScreen={false} />
      </div>
    )
  }

  if (sortedArticles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 text-center">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5">
          <Sparkles size={18} className="text-primary/60" />
        </div>
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/30">
      {sortedArticles.map((article) => (
        <ArticleRow
          key={article.id}
          article={article}
          onToggleLike={onToggleLike}
          onOpenArticle={onOpenArticle}
        />
      ))}
    </div>
  )
})

const ArticleRow = memo(function ArticleRow({
  article,
  onToggleLike,
  onOpenArticle,
}: {
  article: NewsArticle
  onToggleLike: (id: string) => void
  onOpenArticle?: (id: string) => void
}): React.JSX.Element {
  const domain = getDomain(article.url)

  return (
    <div
      className="group/row flex items-start gap-2.5 px-3 py-2 hover:bg-accent/30 transition-colors duration-150 cursor-pointer"
      onClick={() => onOpenArticle?.(article.id)}
    >
      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        {/* Meta row */}
        <div className="flex items-center gap-1.5 mb-0.5">
          {domain && (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground/60 shrink-0">
              <Globe size={7} />
              {domain}
            </span>
          )}
          {article.sourceType === 'ai' && (
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-px rounded bg-primary/10 text-primary shrink-0">
              <Sparkles size={7} />
              AI
            </span>
          )}
          {article.publishedAt && (
            <span className="text-[9px] text-muted-foreground/40">
              {relativeTime(article.publishedAt)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[12px] font-medium leading-snug line-clamp-2 text-foreground">
          {article.title}
        </h3>

        {/* Summary teaser */}
        {article.summary && (
          <p className="text-[11px] text-muted-foreground/70 line-clamp-1 leading-relaxed mt-0.5">
            {article.summary}
          </p>
        )}
      </div>

      {/* Actions (hover-revealed) */}
      <div className="flex items-center gap-px pt-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 shrink-0">
        <Tooltip content={article.isLiked ? 'Unlike' : 'Like'} side="bottom">
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              onToggleLike(article.id)
            }}
            variant="ghost"
            size="xs"
            className="active:scale-90"
          >
            <Heart
              size={12}
              className={
                article.isLiked
                  ? 'text-rose-500 fill-rose-500'
                  : 'text-muted-foreground/40 hover:text-rose-400'
              }
            />
          </IconButton>
        </Tooltip>
        <Tooltip content="Open in browser" side="bottom">
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              openUrl(article.url)
            }}
            variant="ghost"
            size="xs"
          >
            <ExternalLink size={12} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
})
