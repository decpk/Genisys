import { useEffect, useMemo, useState } from 'react'
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  Clock,
  Hash,
  LayoutList,
  List,
  Trash2,
} from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { SearchInput } from '@/components/ui/search-input'
import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { useLibraryStore } from '@/store/library-store'
import {
  useBookmarkStore,
  type BookmarkWithContext,
  type BookmarkViewMode,
} from '@/store/bookmark-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

// ─── View mode config ────────────────────────────────────────────

const VIEW_MODES: { mode: BookmarkViewMode; icon: typeof List; label: string }[] = [
  { mode: 'grouped', icon: LayoutList, label: 'Grouped by book' },
  { mode: 'flat', icon: List, label: 'Flat list' },
  { mode: 'recent', icon: Clock, label: 'Recent first' },
]

// ─── Grouped types ───────────────────────────────────────────────

interface BookGroup {
  bookId: string
  bookTitle: string
  chapters: ChapterGroup[]
}

interface ChapterGroup {
  chapterId: string
  chapterTitle: string
  chapterNumber: number
  bookmarks: BookmarkWithContext[]
}

function groupByBook(bookmarks: BookmarkWithContext[]): BookGroup[] {
  const map = new Map<string, BookGroup>()
  for (const bm of bookmarks) {
    let group = map.get(bm.bookId)
    if (!group) {
      group = { bookId: bm.bookId, bookTitle: bm.bookTitle, chapters: [] }
      map.set(bm.bookId, group)
    }
    let ch = group.chapters.find((c) => c.chapterId === bm.chapterId)
    if (!ch) {
      ch = {
        chapterId: bm.chapterId,
        chapterTitle: bm.chapterTitle,
        chapterNumber: bm.chapterNumber,
        bookmarks: [],
      }
      group.chapters.push(ch)
    }
    ch.bookmarks.push(bm)
  }
  // Sort chapters by number within each book
  for (const g of map.values()) {
    g.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber)
  }
  return Array.from(map.values())
}

// ─── Component ───────────────────────────────────────────────────

export function BookmarksSidebar(): React.JSX.Element {
  const bookmarks = useBookmarkStore((s) => s.bookmarks)
  const isLoaded = useBookmarkStore((s) => s.isLoaded)
  const isLoading = useBookmarkStore((s) => s.isLoading)
  const viewMode = useBookmarkStore((s) => s.viewMode)
  const filter = useBookmarkStore((s) => s.filter)
  const setFilter = useBookmarkStore((s) => s.setFilter)
  const setViewMode = useBookmarkStore((s) => s.setViewMode)
  const loadBookmarks = useBookmarkStore((s) => s.loadBookmarks)
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark)
  const selectBook = useLibraryStore((s) => s.selectBook)
  const selectChapter = useLibraryStore((s) => s.selectChapter)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  // Lazy load: only fetch when this component mounts
  useEffect(() => {
    if (!isLoaded) loadBookmarks()
  }, [isLoaded, loadBookmarks])

  const filtered = useMemo(() => {
    if (!filter) return bookmarks
    const q = filter.toLowerCase()
    return bookmarks.filter(
      (b) =>
        b.label.toLowerCase().includes(q) ||
        b.bookTitle.toLowerCase().includes(q) ||
        b.chapterTitle.toLowerCase().includes(q)
    )
  }, [bookmarks, filter])

  const handleClick = async (bm: BookmarkWithContext): Promise<void> => {
    await selectBook(bm.bookId)
    await selectChapter(bm.chapterId)
    // Scroll to the bookmark's heading after a short delay for render
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(bm.highlightId)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    })
  }

  return (
    <>
      <PanelHeading
        icon={Bookmark}
        title="Bookmarks"
        count={bookmarks.length}
        className="px-3 h-12 border-b border-border/40"
      >
        <div className="flex items-center gap-0.5">
          {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
            <IconButton
              key={mode}
              variant={viewMode === mode ? 'subtle' : 'default'}
              size="sm"
              onClick={() => setViewMode(mode)}
              tooltip={label}
              tooltipSide="bottom"
              className={viewMode === mode ? 'bg-primary/10' : ''}
            >
              <Icon size={13} />
            </IconButton>
          ))}
        </div>
      </PanelHeading>

      <div className="px-2.5 py-2">
        <SearchInput placeholder="Search bookmarks…" value={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <AppLoaderGlyph size={18} className="text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (

          <EmptyState
            icon={Bookmark}
            message={
              filter
                ? 'No bookmarks match your search'
                : 'No bookmarks yet — click the bookmark icon on any section heading while reading'
            }
            className="py-12"
          />
        ) : viewMode === 'grouped' ? (
          <GroupedView
            bookmarks={filtered}
            onClick={handleClick}
            onDelete={(id) =>
              openConfirmDialog({
                title: 'Delete bookmark',
                description: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
                onConfirm: () => removeBookmark(id),
              })
            }
          />
        ) : viewMode === 'recent' ? (
          <RecentView
            bookmarks={filtered}
            onClick={handleClick}
            onDelete={(id) =>
              openConfirmDialog({
                title: 'Delete bookmark',
                description: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
                onConfirm: () => removeBookmark(id),
              })
            }
          />
        ) : (
          <FlatView
            bookmarks={filtered}
            onClick={handleClick}
            onDelete={(id) =>
              openConfirmDialog({
                title: 'Delete bookmark',
                description: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
                onConfirm: () => removeBookmark(id),
              })
            }
          />
        )}
      </div>
    </>
  )
}

// ─── Grouped View ────────────────────────────────────────────────

function GroupedView({
  bookmarks,
  onClick,
  onDelete,
}: {
  bookmarks: BookmarkWithContext[]
  onClick: (bm: BookmarkWithContext) => void
  onDelete: (id: string) => void
}): React.JSX.Element {
  const groups = useMemo(() => groupByBook(bookmarks), [bookmarks])

  return (
    <div className="space-y-1">
      {groups.map((group) => (
        <BookGroupItem
          key={group.bookId}
          group={group}
          onClick={onClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function BookGroupItem({
  group,
  onClick,
  onDelete,
}: {
  group: BookGroup
  onClick: (bm: BookmarkWithContext) => void
  onDelete: (id: string) => void
}): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true)
  const totalCount = group.chapters.reduce((sum, ch) => sum + ch.bookmarks.length, 0)

  return (
    <div className="rounded-md">
      {/* Book header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors text-foreground hover:bg-secondary"
      >
        <ChevronRight
          size={14}
          className={`text-muted-foreground/70 transition-transform duration-200 shrink-0 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
        <BookOpen size={14} className="text-primary/60 shrink-0" />
        <span className="truncate text-xs font-medium leading-tight flex-1 text-left">
          {group.bookTitle}
        </span>
        <span className="text-[10px] text-muted-foreground/50 shrink-0">{totalCount}</span>
      </button>

      {/* Chapters */}
      {isExpanded && (
        <div className="pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="ml-3.5 pl-3 border-l border-border/40">
            {group.chapters.map((ch) => (
              <ChapterGroupItem
                key={ch.chapterId}
                chapter={ch}
                onClick={onClick}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ChapterGroupItem({
  chapter,
  onClick,
  onDelete,
}: {
  chapter: ChapterGroup
  onClick: (bm: BookmarkWithContext) => void
  onDelete: (id: string) => void
}): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div>
      {/* Chapter header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary text-left"
      >
        <ChevronRight
          size={12}
          className={`text-muted-foreground/50 transition-transform duration-200 shrink-0 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
        <Hash size={11} className="shrink-0 text-muted-foreground/50" />
        <span className="truncate text-xs flex-1">
          Ch. {chapter.chapterNumber} — {chapter.chapterTitle}
        </span>
        <span className="text-[10px] text-muted-foreground/40 shrink-0">
          {chapter.bookmarks.length}
        </span>
      </button>

      {/* Bookmark items */}
      {isExpanded && (
        <div className="ml-4 pl-3 border-l border-border/30">
          {chapter.bookmarks.map((bm) => (
            <BookmarkItem key={bm.id} bookmark={bm} onClick={onClick} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Flat View ───────────────────────────────────────────────────

function FlatView({
  bookmarks,
  onClick,
  onDelete,
}: {
  bookmarks: BookmarkWithContext[]
  onClick: (bm: BookmarkWithContext) => void
  onDelete: (id: string) => void
}): React.JSX.Element {
  const sorted = useMemo(
    () => [...bookmarks].sort((a, b) => a.label.localeCompare(b.label)),
    [bookmarks]
  )

  return (
    <div className="space-y-0.5">
      {sorted.map((bm) => (
        <BookmarkItem key={bm.id} bookmark={bm} onClick={onClick} onDelete={onDelete} showContext />
      ))}
    </div>
  )
}

// ─── Recent View ─────────────────────────────────────────────────

function RecentView({
  bookmarks,
  onClick,
  onDelete,
}: {
  bookmarks: BookmarkWithContext[]
  onClick: (bm: BookmarkWithContext) => void
  onDelete: (id: string) => void
}): React.JSX.Element {
  // Already sorted by created_at DESC from the backend
  return (
    <div className="space-y-0.5">
      {bookmarks.map((bm) => (
        <BookmarkItem key={bm.id} bookmark={bm} onClick={onClick} onDelete={onDelete} showContext showTime />
      ))}
    </div>
  )
}

// ─── Shared bookmark item ────────────────────────────────────────

function BookmarkItem({
  bookmark,
  onClick,
  onDelete,
  showContext = false,
  showTime = false,
}: {
  bookmark: BookmarkWithContext
  onClick: (bm: BookmarkWithContext) => void
  onDelete: (id: string) => void
  showContext?: boolean
  showTime?: boolean
}): React.JSX.Element {
  return (
    <div
      onClick={() => onClick(bookmark)}
      className="group flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
    >
      <Bookmark size={11} className="shrink-0 text-primary/50" />
      <div className="flex-1 min-w-0">
        <span className="block truncate text-xs leading-tight">{bookmark.label}</span>
        {showContext && (
          <span className="block truncate text-[10px] text-muted-foreground/50 mt-0.5">
            Ch. {bookmark.chapterNumber} · {bookmark.bookTitle}
          </span>
        )}
        {(showContext || showTime) && (
          <span className="block text-[10px] text-muted-foreground/40 mt-0.5">
            {formatRelativeTime(bookmark.createdAt)}
          </span>
        )}
      </div>
      <IconButton
          variant="destructive"
          size="xs"
          showOnHover
          tooltip="Remove bookmark"
          tooltipSide="right"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(bookmark.id)
          }}
        >
          <Trash2 size={11} />
        </IconButton>
    </div>
  )
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
