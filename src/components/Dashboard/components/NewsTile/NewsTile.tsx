import { memo, useState, useEffect, useCallback, useRef } from 'react'
import {
  Newspaper, RefreshCw, GripVertical, Plus,
  Heart, Pencil, X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useNewsTileStore } from '@/store/news-tile-store'
import type { NewsInterest } from '@/store/news-tile-store'
import type { TileWidth } from '@/store/dashboard-store'
import type { DragHandleProps } from '../SortableTile/SortableTile.types'
import { getCategoryEntry } from './news-categories'
import { NewsArticleList } from './NewsArticleList'
import { LikedArticlesView } from './LikedArticlesView'
import { ArticleReader } from './ArticleReader'
import { AddInterestDialog } from './AddInterestDialog'
import { EditInterestDialog } from './EditInterestDialog'
import { useNewsFetch } from './hooks/useNewsFetch'
import { relativeTime } from '@/lib/format'
import { TileResizeMenu } from '../TileResizeMenu'

const LIKED_TAB = '__liked__'

interface NewsTileProps {
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  dragHandleProps: DragHandleProps
}

export const NewsTile = memo(function NewsTile({
  tileWidth,
  onWidthChange,
  dragHandleProps,
}: NewsTileProps): React.JSX.Element {
  const tile = useNewsTileStore((s) => s.tile)
  const interests = useNewsTileStore((s) => s.interests)
  const articlesByInterest = useNewsTileStore((s) => s.articlesByInterest)
  const likedArticles = useNewsTileStore((s) => s.likedArticles)
  const loadingByInterest = useNewsTileStore((s) => s.loadingByInterest)
  const toggleLike = useNewsTileStore((s) => s.toggleLike)
  const addInterest = useNewsTileStore((s) => s.addInterest)
  const removeInterest = useNewsTileStore((s) => s.removeInterest)
  const updateInterest = useNewsTileStore((s) => s.updateInterest)
  const loadLikedArticles = useNewsTileStore((s) => s.loadLikedArticles)
  const loadArticlesForInterest = useNewsTileStore((s) => s.loadArticlesForInterest)

  const { fetchForInterest, refreshAll, fetchArticleBody } = useNewsFetch()

  const [activeTab, setActiveTab] = useState(LIKED_TAB)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingInterest, setEditingInterest] = useState<NewsInterest | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [openArticleId, setOpenArticleId] = useState<string | null>(null)
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const initialLoadDone = useRef(false)

  const handleTabHoverEnter = useCallback((id: string) => {
    if (hoverTimeoutRef.current) { clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = null }
    setHoveredTabId(id)
  }, [])

  const handleTabHoverLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredTabId(null), 150)
  }, [])

  // Load liked articles + articles for each interest on mount
  useEffect(() => {
    if (!tile || initialLoadDone.current) return
    initialLoadDone.current = true
    loadLikedArticles()
    for (const interest of interests) {
      loadArticlesForInterest(interest.id)
    }
  }, [tile, interests, loadLikedArticles, loadArticlesForInterest])

  // Auto-fetch stale interests on mount
  useEffect(() => {
    if (!tile || interests.length === 0) return
    const timer = setTimeout(() => {
      for (const interest of interests) {
        fetchForInterest(interest, false)
      }
    }, 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tile?.id])

  // If active tab is removed, fall back to liked
  useEffect(() => {
    if (activeTab !== LIKED_TAB && !interests.find((i) => i.id === activeTab)) {
      setActiveTab(LIKED_TAB)
    }
  }, [activeTab, interests])

  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true)
    await refreshAll()
    setIsRefreshing(false)
  }, [refreshAll])

  const handleRefreshTab = useCallback(async () => {
    if (activeTab === LIKED_TAB) return
    const interest = interests.find((i) => i.id === activeTab)
    if (interest) {
      await fetchForInterest(interest, true)
    }
  }, [activeTab, interests, fetchForInterest])

  const handleAddInterests = useCallback(
    (items: { categoryKey: string; label: string; customPrompt: string }[]) => {
      let lastId = ''
      for (const item of items) {
        lastId = addInterest(item)
      }
      if (lastId) setActiveTab(lastId)
      // Fetch for newly added interests
      setTimeout(() => {
        const currentInterests = useNewsTileStore.getState().interests
        for (const item of items) {
          const found = currentInterests.find((i) => i.label === item.label)
          if (found) fetchForInterest(found, true)
        }
      }, 100)
    },
    [addInterest, fetchForInterest],
  )

  const handleEditSave = useCallback(
    (id: string, patch: { label: string; customPrompt: string; resolvedUrl: string | null }) => {
      updateInterest(id, patch)
      // Re-fetch with new prompt/url
      setTimeout(() => {
        const interest = useNewsTileStore.getState().interests.find((i) => i.id === id)
        if (interest) fetchForInterest(interest, true)
      }, 100)
    },
    [updateInterest, fetchForInterest],
  )

  const handleRemoveInterest = useCallback(
    (id: string) => {
      removeInterest(id)
      if (activeTab === id) setActiveTab(LIKED_TAB)
    },
    [removeInterest, activeTab],
  )

  // Current tab data
  const activeInterest = activeTab !== LIKED_TAB ? interests.find((i) => i.id === activeTab) : null
  const currentArticles = activeInterest ? (articlesByInterest[activeInterest.id] ?? []) : []
  const currentLoading = activeInterest ? (loadingByInterest[activeInterest.id] ?? false) : false
  const anyLoading = isRefreshing || Object.values(loadingByInterest).some(Boolean)

  // Last refreshed time for header
  const lastRefreshed = activeInterest?.lastRefreshedAt
    ? relativeTime(activeInterest.lastRefreshedAt)
    : null

  const likedCount = likedArticles.length

  return (
    <div className="@container group relative border border-border rounded-lg bg-card overflow-hidden flex flex-col h-[400px]">
      {/* ── Full-tile Article Reader (replaces header + tabs + content) ── */}
      {openArticleId && (() => {
        const allArticles = [...Object.values(articlesByInterest).flat(), ...likedArticles]
        const article = allArticles.find((a) => a.id === openArticleId)
        if (!article) return null
        return (
          <ArticleReader
            article={article}
            onBack={() => setOpenArticleId(null)}
            onToggleLike={toggleLike}
            fetchArticleBody={fetchArticleBody}
          />
        )
      })()}

      {/* ── Header (hidden when reader is open) ── */}
      {!openArticleId && (
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
          <Newspaper size={14} className="text-primary" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          News & Interests
        </span>

        {lastRefreshed && activeTab !== LIKED_TAB && (
          <span className="text-[10px] text-muted-foreground/50 ml-auto mr-1 shrink-0">
            {lastRefreshed}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {activeTab !== LIKED_TAB && (
            <Button
              onClick={handleRefreshTab}
              disabled={currentLoading}
              variant="ghost"
              size="xs"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <span className="w-3 h-3 flex items-center justify-center">
                {currentLoading ? <AppLoaderGlyph size={12} /> : <RefreshCw size={12} />}
              </span>
              Refresh Tab
            </Button>
          )}
          <Button
            onClick={handleRefreshAll}
            disabled={anyLoading}
            variant="ghost"
            size="xs"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span className="w-3 h-3 flex items-center justify-center">
              {anyLoading ? <AppLoaderGlyph size={12} /> : <RefreshCw size={12} />}
            </span>
            Refresh All
          </Button>
          <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} iconSize={13} />
          <IconButton
            tooltip="Drag to reorder"
            tooltipSide="bottom"
            size="xs"
            className="cursor-grab active:cursor-grabbing"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripVertical size={13} />
          </IconButton>
        </div>
      </div>
      )}

      {/* ── Tab Strip (hidden when reader is open) ── */}
      {!openArticleId && (
      <div className="relative shrink-0 border-b border-border/20">
        {/* Fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent z-10" />

        <div
          ref={tabsRef}
          className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto scrollbar-none scroll-smooth"
        >
          {/* Liked tab (pinned first) */}
          <button
            onClick={() => setActiveTab(LIKED_TAB)}
            className={`
              shrink-0 inline-flex items-center gap-1 rounded-full px-3 h-7 text-xs font-medium transition-all duration-200 cursor-pointer select-none
              ${activeTab === LIKED_TAB
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
              }
            `}
          >
            <Heart size={12} className={activeTab === LIKED_TAB ? 'fill-rose-500' : ''} />
            Liked
            {likedCount > 0 && (
              <span className="text-[10px] leading-none opacity-60">{likedCount}</span>
            )}
          </button>

          {/* Separator */}
          {interests.length > 0 && (
            <div className="w-px h-4 bg-border/30 shrink-0 mx-0.5" />
          )}

          {/* Interest tabs */}
          {interests.map((interest) => {
            const cat = getCategoryEntry(interest.categoryKey)
            const Icon = cat.icon
            const isActive = activeTab === interest.id
            const loading = loadingByInterest[interest.id] ?? false
            const count = (articlesByInterest[interest.id] ?? []).length

            return (
              <Popover key={interest.id} open={hoveredTabId === interest.id}>
                <div
                  className="shrink-0 relative flex items-center"
                  onMouseEnter={() => handleTabHoverEnter(interest.id)}
                  onMouseLeave={handleTabHoverLeave}
                >
                  <PopoverTrigger asChild>
                    <button
                      onClick={() => setActiveTab(interest.id)}
                      className={`
                        inline-flex items-center gap-1 rounded-full px-3 h-7 text-xs font-medium transition-all duration-200 cursor-pointer select-none
                        ${isActive
                          ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-foreground border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
                        }
                      `}
                    >
                      <span className="w-3 h-3 flex items-center justify-center shrink-0">
                        {loading ? <AppLoaderGlyph size={11} /> : <Icon size={11} />}
                      </span>
                      {interest.label}
                      {count > 0 && (
                        <span className="text-[10px] leading-none opacity-40">{count}</span>
                      )}
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent
                  side="top"
                  className="w-auto p-1 flex items-center gap-0.5"
                  sideOffset={4}
                  onMouseEnter={() => handleTabHoverEnter(interest.id)}
                  onMouseLeave={handleTabHoverLeave}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <Tooltip content="Edit" side="bottom">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        setHoveredTabId(null)
                        setEditingInterest(interest)
                      }}
                      variant="ghost"
                      size="xs"
                    >
                      <Pencil size={11} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Remove" side="bottom">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        setHoveredTabId(null)
                        handleRemoveInterest(interest.id)
                      }}
                      variant="destructive"
                      size="xs"
                    >
                      <X size={11} />
                    </IconButton>
                  </Tooltip>
                </PopoverContent>
              </Popover>
            )
          })}

          {/* Add tab button */}
          <Tooltip content="Add interest" side="bottom">
            <IconButton
              onClick={() => setIsAddDialogOpen(true)}
              variant="ghost"
              size="xs"
              className="rounded-full border border-dashed border-border/40 hover:border-primary/40"
            >
              <Plus size={12} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      )}

      {/* ── Content (hidden when reader is open) ── */}
      {!openArticleId && (
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {activeTab === LIKED_TAB ? (
          <LikedArticlesView
            likedArticles={likedArticles}
            interests={interests}
            onToggleLike={toggleLike}
            onOpenArticle={setOpenArticleId}
          />
        ) : activeInterest ? (
          <NewsArticleList
            articles={currentArticles}
            isLoading={currentLoading}
            onToggleLike={toggleLike}
            onOpenArticle={setOpenArticleId}
            emptyMessage={`No articles yet for "${activeInterest.label}". Hit refresh to fetch the latest.`}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Newspaper size={22} className="text-primary/60" />
            </div>
            <p className="text-sm font-medium text-foreground/80 mb-1">Your news feed is empty</p>
            <p className="text-xs text-muted-foreground mb-3">
              Add topics you care about to start curating your daily digest.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="link"
              size="xs"
            >
              <Plus size={12} />
              Add your first interest
            </Button>
          </div>
        )}
      </div>
      )}

      {/* ── Dialogs ── */}
      <AddInterestDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddInterests}
        existingLabels={interests.map((i) => i.label)}
      />
      <EditInterestDialog
        isOpen={editingInterest !== null}
        interest={editingInterest}
        onClose={() => setEditingInterest(null)}
        onSave={handleEditSave}
      />
    </div>
  )
})
