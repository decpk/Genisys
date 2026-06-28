import { create } from 'zustand'

// ── Types ────────────────────────────────────────────────────────────

export interface NewsTileConfig {
  id: string
  tileWidth: string
  refreshIntervalMs: number
  lastRefreshedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface NewsInterest {
  id: string
  tileId: string
  categoryKey: string
  label: string
  customPrompt: string
  resolvedUrl: string | null
  position: number
  lastRefreshedAt: string | null
  createdAt: string
}

export interface NewsArticle {
  id: string
  interestId: string
  sourceType: 'ai' | 'url'
  title: string
  summary: string
  url: string
  sourceName: string
  author: string
  publishedAt: string | null
  fetchedAt: string
  isLiked: boolean
  likedAt: string | null
  rawHash: string
  extrasJson: string
}

interface NewsTileState {
  tile: NewsTileConfig | null
  interests: NewsInterest[]
  articlesByInterest: Record<string, NewsArticle[]>
  likedArticles: NewsArticle[]
  loadingByInterest: Record<string, boolean>
  isLoaded: boolean
}

interface NewsTileActions {
  loadAll: () => Promise<void>
  createTile: () => void
  removeTile: () => void
  addInterest: (params: { categoryKey: string; label: string; customPrompt: string }) => string
  updateInterest: (id: string, patch: Partial<Pick<NewsInterest, 'label' | 'customPrompt' | 'resolvedUrl'>>) => void
  removeInterest: (id: string) => void
  reorderInterests: (ids: string[]) => void
  setTileWidth: (width: string) => void
  setInterestLoading: (id: string, loading: boolean) => void
  setArticlesForInterest: (interestId: string, articles: NewsArticle[]) => void
  setResolvedUrl: (interestId: string, url: string) => void
  setInterestRefreshedAt: (interestId: string, at: string) => void
  toggleLike: (articleId: string) => void
  loadLikedArticles: () => Promise<void>
  loadArticlesForInterest: (interestId: string) => Promise<void>
  tileExists: () => boolean
  setArticleExtras: (articleId: string, extras: Record<string, unknown>) => void
}

// ── Helpers ──────────────────────────────────────────────────────────

const NEWS_TILE_ID = '__news_tile__'

function generateInterestId(): string {
  return `news-int-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generateArticleId(): string {
  return `news-art-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function persistTile(tile: NewsTileConfig | null): void {
  window.api?.saveNewsTile(tile)
}

function persistInterests(tileId: string, interests: NewsInterest[]): void {
  window.api?.saveNewsInterests(tileId, interests)
}

// ── Store ────────────────────────────────────────────────────────────

export const useNewsTileStore = create<NewsTileState & NewsTileActions>()(
  (set, get) => ({
    tile: null,
    interests: [],
    articlesByInterest: {},
    likedArticles: [],
    loadingByInterest: {},
    isLoaded: false,

    loadAll: async () => {
      if (get().isLoaded) return
      try {
        const tile = await window.api.loadNewsTile()
        if (!tile) {
          set({ isLoaded: true })
          return
        }
        const interests = await window.api.loadNewsInterests(tile.id)
        set({ tile, interests: interests ?? [], isLoaded: true })
      } catch (e) {
        console.error('[news-tile-store] loadAll failed:', e)
        set({ isLoaded: true })
      }
    },

    createTile: () => {
      if (get().tile) return
      const now = new Date().toISOString()
      const tile: NewsTileConfig = {
        id: NEWS_TILE_ID,
        tileWidth: 'half',
        refreshIntervalMs: 86_400_000,
        lastRefreshedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      set({ tile })
      persistTile(tile)
    },

    removeTile: () => {
      set({ tile: null, interests: [], articlesByInterest: {}, likedArticles: [] })
      persistTile(null)
    },

    addInterest: ({ categoryKey, label, customPrompt }) => {
      const { tile, interests } = get()
      if (!tile) return ''
      const id = generateInterestId()
      const interest: NewsInterest = {
        id,
        tileId: tile.id,
        categoryKey,
        label,
        customPrompt,
        resolvedUrl: null,
        position: interests.length,
        lastRefreshedAt: null,
        createdAt: new Date().toISOString(),
      }
      const updated = [...interests, interest]
      set({ interests: updated })
      persistInterests(tile.id, updated)
      return id
    },

    updateInterest: (id, patch) => {
      const { tile, interests } = get()
      if (!tile) return
      const updated = interests.map((i) =>
        i.id === id ? { ...i, ...patch } : i,
      )
      set({ interests: updated })
      persistInterests(tile.id, updated)
    },

    removeInterest: (id) => {
      const { tile, interests, articlesByInterest } = get()
      if (!tile) return
      const updated = interests
        .filter((i) => i.id !== id)
        .map((i, idx) => ({ ...i, position: idx }))
      const { [id]: _, ...restArticles } = articlesByInterest
      set({ interests: updated, articlesByInterest: restArticles })
      persistInterests(tile.id, updated)
      window.api?.deleteNewsArticlesForInterest(id)
    },

    reorderInterests: (ids) => {
      const { tile, interests } = get()
      if (!tile) return
      const map = new Map(interests.map((i) => [i.id, i]))
      const reordered = ids
        .map((id, idx) => {
          const interest = map.get(id)
          return interest ? { ...interest, position: idx } : null
        })
        .filter(Boolean) as NewsInterest[]
      set({ interests: reordered })
      persistInterests(tile.id, reordered)
    },

    setTileWidth: (width) => {
      const { tile } = get()
      if (!tile || tile.tileWidth === width) return
      const updated = { ...tile, tileWidth: width, updatedAt: new Date().toISOString() }
      set({ tile: updated })
      persistTile(updated)
    },

    setInterestLoading: (id, loading) => {
      set((s) => ({
        loadingByInterest: { ...s.loadingByInterest, [id]: loading },
      }))
    },

    setArticlesForInterest: (interestId, articles) => {
      set((s) => ({
        articlesByInterest: { ...s.articlesByInterest, [interestId]: articles },
      }))
      window.api?.saveNewsArticles(interestId, articles)
    },

    setResolvedUrl: (interestId, url) => {
      const { tile, interests } = get()
      if (!tile) return
      const updated = interests.map((i) =>
        i.id === interestId ? { ...i, resolvedUrl: url } : i,
      )
      set({ interests: updated })
      persistInterests(tile.id, updated)
    },

    setInterestRefreshedAt: (interestId, at) => {
      const { tile, interests } = get()
      if (!tile) return
      const updated = interests.map((i) =>
        i.id === interestId ? { ...i, lastRefreshedAt: at } : i,
      )
      set({ interests: updated })
      persistInterests(tile.id, updated)
    },

    toggleLike: (articleId) => {
      const { articlesByInterest, likedArticles } = get()
      let found: NewsArticle | null = null

      // Find and toggle in interest articles
      const updatedByInterest = { ...articlesByInterest }
      for (const [iid, articles] of Object.entries(updatedByInterest)) {
        const idx = articles.findIndex((a) => a.id === articleId)
        if (idx >= 0) {
          found = articles[idx]
          const toggled = {
            ...found,
            isLiked: !found.isLiked,
            likedAt: !found.isLiked ? new Date().toISOString() : null,
          }
          updatedByInterest[iid] = articles.map((a) => (a.id === articleId ? toggled : a))
          found = toggled
          break
        }
      }

      // Also check liked articles list
      if (!found) {
        const idx = likedArticles.findIndex((a) => a.id === articleId)
        if (idx >= 0) {
          found = { ...likedArticles[idx], isLiked: false, likedAt: null }
        }
      }

      if (found) {
        window.api?.toggleNewsArticleLiked(articleId, found.isLiked)
        // Rebuild liked articles
        const allArticles = Object.values(updatedByInterest).flat()
        const newLiked = found.isLiked
          ? [...likedArticles.filter((a) => a.id !== articleId), found].sort(
              (a, b) => (b.likedAt ?? '').localeCompare(a.likedAt ?? ''),
            )
          : likedArticles.filter((a) => a.id !== articleId)
        set({ articlesByInterest: updatedByInterest, likedArticles: newLiked })
      }
    },

    loadLikedArticles: async () => {
      const { tile } = get()
      if (!tile) return
      try {
        const liked = await window.api.loadLikedNewsArticles(tile.id)
        set({ likedArticles: liked ?? [] })
      } catch (e) {
        console.error('[news-tile-store] loadLikedArticles failed:', e)
      }
    },

    loadArticlesForInterest: async (interestId) => {
      try {
        const articles = await window.api.loadNewsArticles(interestId)
        set((s) => ({
          articlesByInterest: { ...s.articlesByInterest, [interestId]: articles ?? [] },
        }))
      } catch (e) {
        console.error('[news-tile-store] loadArticlesForInterest failed:', e)
      }
    },

    tileExists: () => get().tile !== null,

    setArticleExtras: (articleId, extras) => {
      const { articlesByInterest, likedArticles } = get()
      const extrasJson = JSON.stringify(extras)

      const updatedByInterest = { ...articlesByInterest }
      let interestIdForSave: string | null = null
      for (const [iid, articles] of Object.entries(updatedByInterest)) {
        const idx = articles.findIndex((a) => a.id === articleId)
        if (idx >= 0) {
          updatedByInterest[iid] = articles.map((a) =>
            a.id === articleId ? { ...a, extrasJson } : a,
          )
          interestIdForSave = iid
          break
        }
      }

      const updatedLiked = likedArticles.map((a) =>
        a.id === articleId ? { ...a, extrasJson } : a,
      )

      set({ articlesByInterest: updatedByInterest, likedArticles: updatedLiked })
      if (interestIdForSave) {
        window.api?.saveNewsArticles(interestIdForSave, updatedByInterest[interestIdForSave])
      }
    },
  }),
)

export { NEWS_TILE_ID, generateArticleId }
