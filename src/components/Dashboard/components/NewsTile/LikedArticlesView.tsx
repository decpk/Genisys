import { memo, useMemo } from 'react'
import { Heart } from 'lucide-react'

import type { NewsArticle, NewsInterest } from '@/store/news-tile-store'
import { NewsArticleList } from './NewsArticleList'

interface LikedArticlesViewProps {
  likedArticles: NewsArticle[]
  interests: NewsInterest[]
  onToggleLike: (articleId: string) => void
  onOpenArticle?: (articleId: string) => void
}

export const LikedArticlesView = memo(function LikedArticlesView({
  likedArticles,
  interests,
  onToggleLike,
  onOpenArticle,
}: LikedArticlesViewProps): React.JSX.Element {
  // Group liked articles by interest
  const grouped = useMemo(() => {
    const interestMap = new Map(interests.map((i) => [i.id, i]))
    const groups = new Map<string, { label: string; articles: NewsArticle[] }>()

    for (const article of likedArticles) {
      const interest = interestMap.get(article.interestId)
      const label = interest?.label ?? 'Unknown'
      if (!groups.has(label)) groups.set(label, { label, articles: [] })
      groups.get(label)!.articles.push(article)
    }

    return Array.from(groups.values())
  }, [likedArticles, interests])

  if (likedArticles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-3">
          <Heart size={22} className="text-rose-400/60" />
        </div>
        <p className="text-sm text-muted-foreground">No liked articles yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Heart articles you love to save them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm px-3 py-1.5 border-b border-border/20">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
              <span className="ml-1.5 text-muted-foreground/50">
                {group.articles.length}
              </span>
            </span>
          </div>
          <NewsArticleList
            articles={group.articles}
            isLoading={false}
            onToggleLike={onToggleLike}
            onOpenArticle={onOpenArticle}
          />
        </div>
      ))}
    </div>
  )
})
