import { useEffect, useMemo, useState } from 'react'
import {
  GraduationCap,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bookmark,
  FileText,
  CircleCheck,
  BookOpen,
  Globe,
  Share2,
} from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { SearchInput } from '@/components/ui/search-input'
import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/frameworks/right-panel/Tabs'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useLibraryStore, type BookMeta } from '@/store/library-store'
import { useWebpageStore, type SavedWebpage } from '@/store/webpage-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useBookmarkStore } from '@/store/bookmark-store'

import { NewBookDialog } from './NewBookDialog'
import { ImportWebpageDialog } from './ImportWebpageDialog'
import { BookmarksSidebar } from './BookmarksSidebar'
import { WebpageItemMenu } from './WebpageItemMenu'
import { RenameWebpageDialog } from './RenameWebpageDialog'
import { WebpageEditorModal } from './WebpageEditorModal'
import { DevicePickerDialog } from '@/components/ContentShare'
import type { ShareTarget } from '@/components/ContentShare/types'

type SidebarTab = 'books' | 'bookmarks' | 'webpages'

const STATUS_ICON = {
  generating: AppLoaderGlyph,
  completed: CheckCircle2,
  error: AlertCircle,
  pending: Clock,
} as const

const STATUS_CLASS = {
  generating: 'text-primary',
  completed: 'text-success',
  error: 'text-destructive',
  pending: 'text-muted-foreground/50',
} as const

const STATUS_LABEL: Record<string, string> = {
  generating: 'Generating',
  completed: 'Ready',
  error: 'Error',
  pending: 'Pending',
}

export function LibrarySidebar(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SidebarTab>('books')

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SidebarTab)}>
        <TabsList className="sticky top-0 z-10 shrink-0">
          <TabsTrigger value="books" icon={<GraduationCap size={14} />}>Books</TabsTrigger>
          <TabsTrigger value="webpages" icon={<Globe size={14} />}>Pages</TabsTrigger>
          <TabsTrigger value="bookmarks" icon={<Bookmark size={14} />}>Bookmarks</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tab content */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'books' && <BooksSidebarContent />}
        {activeTab === 'webpages' && <WebpagesSidebarContent />}
        {activeTab === 'bookmarks' && <BookmarksSidebar />}
      </div>
    </div>
  )
}

function BooksSidebarContent(): React.JSX.Element {
  const [filter, setFilter] = useState('')
  const [showNewBook, setShowNewBook] = useState(false)
  const [showImportWebpage, setShowImportWebpage] = useState(false)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)

  const books = useLibraryStore((s) => s.books)
  const activeBookId = useLibraryStore((s) => s.activeBookId)
  const activeBook = useLibraryStore((s) => s.activeBook)
  const activeChapterId = useLibraryStore((s) => s.activeChapterId)
  const selectBook = useLibraryStore((s) => s.selectBook)
  const selectChapter = useLibraryStore((s) => s.selectChapter)
  const removeBook = useLibraryStore((s) => s.removeBook)
  const selectWebpage = useWebpageStore((s) => s.selectWebpage)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  // Bookmarks - lazily loaded once per session so chapter rows can show a
  // "contains bookmarks" indicator without waiting for the user to open the
  // Bookmarks tab.
  const allBookmarks = useBookmarkStore((s) => s.bookmarks)
  const bookmarksLoaded = useBookmarkStore((s) => s.isLoaded)
  const loadBookmarks = useBookmarkStore((s) => s.loadBookmarks)

  useEffect(() => {
    if (!bookmarksLoaded) {
      void loadBookmarks()
    }
  }, [bookmarksLoaded, loadBookmarks])

  const bookmarkCountByChapter = useMemo(() => {
    const map = new Map<string, number>()
    for (const bm of allBookmarks) {
      map.set(bm.chapterId, (map.get(bm.chapterId) ?? 0) + 1)
    }
    return map
  }, [allBookmarks])

  const filtered = filter
    ? books.filter((b) => b.title.toLowerCase().includes(filter.toLowerCase()))
    : books

  return (
    <>
      <PanelHeading icon={GraduationCap} title="Library" count={books.length} className="px-3 h-9">
        <DropdownMenu>
          <Tooltip content="Add content" side="bottom">
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="subtle"
                size="sm"
                className="size-7 bg-primary/10 hover:bg-primary/20"
              >
                <Plus size={14} strokeWidth={2.5} />
              </IconButton>
            </DropdownMenuTrigger>
          </Tooltip>
          <DropdownMenuContent align="end" sideOffset={6} className="min-w-[180px]">
            <DropdownMenuItem
              onSelect={() => setShowNewBook(true)}
              className="flex items-center gap-2 text-xs cursor-pointer"
            >
              <BookOpen size={14} />
              Add Book / Article
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setShowImportWebpage(true)}
              className="flex items-center gap-2 text-xs cursor-pointer"
            >
              <Globe size={14} />
              Import Webpage
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PanelHeading>

      <div className="px-2.5 py-2">
        <SearchInput placeholder="Search books…" value={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            message={filter ? 'No books match your search' : 'No books yet — create one to get started'}
            className="py-12"
          />
        ) : (
          <div className="space-y-0.5">
            {filtered.map((book) => (
              <BookSidebarItem
                key={book.id}
                book={book}
                isActive={book.id === activeBookId}
                activeChapterId={activeChapterId}
                chapters={
                  activeBook && activeBook.book.id === book.id
                    ? activeBook.chapters
                    : undefined
                }
                bookmarkCountByChapter={bookmarkCountByChapter}
                onSelect={() => {
                  selectWebpage(null)
                  selectBook(book.id)
                }}
                onSelectChapter={selectChapter}
                onShare={() =>
                  setShareTarget({ type: 'book', bookId: book.id, label: book.title })
                }
                onDelete={() =>
                  openConfirmDialog({
                    title: 'Delete book',
                    description: `Are you sure you want to delete "${book.title}"? All chapters will be permanently removed. This action cannot be undone.`,
                    onConfirm: () => removeBook(book.id),
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      <NewBookDialog open={showNewBook} onOpenChange={setShowNewBook} />
      <ImportWebpageDialog open={showImportWebpage} onOpenChange={setShowImportWebpage} />
      <DevicePickerDialog
        open={shareTarget !== null}
        onOpenChange={(o) => {
          if (!o) setShareTarget(null)
        }}
        target={shareTarget}
      />
    </>
  )
}

function BookSidebarItem({
  book,
  isActive,
  activeChapterId,
  chapters,
  bookmarkCountByChapter,
  onSelect,
  onSelectChapter,
  onShare,
  onDelete,
}: {
  book: BookMeta
  isActive: boolean
  activeChapterId: string | null
  chapters?: { id: string; title: string; chapterNumber: number; status: string; isRead: boolean }[]
  bookmarkCountByChapter: Map<string, number>
  onSelect: () => void
  onSelectChapter: (id: string) => void
  onShare: () => void
  onDelete: () => void
}): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const hasChapters = chapters && chapters.length > 0
  const StatusIcon = STATUS_ICON[book.status as keyof typeof STATUS_ICON] ?? Clock
  const statusLabel = STATUS_LABEL[book.status] ?? 'Unknown'
  const readCount = hasChapters ? chapters.filter((c) => c.isRead).length : 0
  const totalChapters = hasChapters ? chapters.length : 0
  const readProgress = hasChapters ? (readCount / totalChapters) * 100 : 0
  const isComplete = hasChapters && readCount === totalChapters

  const handleToggle = (e: React.MouseEvent): void => {
    e.stopPropagation()
    if (!isActive) {
      onSelect()
    }
    setIsExpanded((v) => !v)
  }

  return (
    <div
      className={`rounded-md transition-colors ${
        isActive
          ? "bg-muted/50 border border-border/40"
          : "border border-transparent hover:bg-secondary/60"
      }`}
    >
      {/* Book row */}
      <div
        onClick={() => {
          onSelect();
          if (!isActive) setIsExpanded(true);
        }}
        className={`group flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {/* Book icon / chevron */}
        <div className="shrink-0 mt-0.5">
          {hasChapters ? (
            <button
              onClick={handleToggle}
              className="flex items-center justify-center cursor-pointer"
            >
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                } ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          ) : (
            <BookOpen
              size={14}
              className={isActive ? "text-foreground" : "text-muted-foreground"}
            />
          )}
        </div>

        {/* Book info */}
        <div className="flex-1 min-w-0">
          <span className="block truncate text-xs font-medium leading-snug">
            {book.title}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <StatusIcon
              size={11}
              className={
                STATUS_CLASS[book.status as keyof typeof STATUS_CLASS] ??
                "text-muted-foreground"
              }
            />
            <span className="text-[10px] text-muted-foreground/70 font-medium">
              {statusLabel}
            </span>
            {hasChapters && (
              <>
                <span className="text-muted-foreground/25 text-[10px]">·</span>
                <span
                  className={`text-[10px] font-medium ${
                    isComplete ? "text-success" : "text-muted-foreground/60"
                  }`}
                >
                  {readCount}/{totalChapters} read
                </span>
              </>
            )}
          </div>
        </div>

        {/* Share to device */}
        <IconButton
          variant="ghost"
          size="xs"
          showOnHover
          tooltip="Share to device"
          tooltipSide="right"
          className="mt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
        >
          <Share2 size={12} />
        </IconButton>

        {/* Delete button */}
        <IconButton
          variant="destructive"
          size="xs"
          showOnHover
          tooltip="Delete book"
          tooltipSide="right"
          className="mt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={12} />
        </IconButton>
      </div>

      {/* Mini progress bar — full width */}
      {hasChapters && totalChapters > 0 && (
        <div className="pl-8 pr-2 pb-2">
          <div className="h-1.5 rounded-full bg-muted-foreground/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isComplete ? "bg-success" : "bg-primary/70"
              }`}
              style={{ width: `${readProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Chapters list */}
      {isActive && isExpanded && hasChapters && (
        <div className="pb-2 pt-0.5 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="ml-4 space-y-px">
            {chapters.map((ch) => {
              const isChActive = ch.id === activeChapterId;
              const isChRead = ch.isRead;
              const bmCount = bookmarkCountByChapter.get(ch.id) ?? 0;

              return (
                <button
                  key={ch.id}
                  onClick={() => onSelectChapter(ch.id)}
                  className={`w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[11px] transition-colors cursor-pointer text-left min-w-0 group/ch ${
                    isChActive
                      ? "text-foreground bg-primary/8 border border-primary/15 font-medium"
                      : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {/* Chapter number badge */}
                  <div className="relative shrink-0">
                    {isChActive ? (
                      <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
                        <FileText size={10} className="text-primary" />
                      </div>
                    ) : isChRead ? (
                      <div className="w-5 h-5 rounded-md bg-success/15 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-success">
                          {ch.chapterNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-primary/10 group-hover/ch:bg-primary/15 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-primary">
                          {ch.chapterNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Chapter title */}
                  <span className="truncate flex-1 leading-snug">
                    {ch.title}
                  </span>

                  {/* Bookmark indicator */}
                  {bmCount > 0 && (
                    <span
                      className="shrink-0 inline-flex items-center gap-0.5 text-primary"
                      title={`${bmCount} bookmark${bmCount > 1 ? 's' : ''}`}
                    >
                      <Bookmark size={10} fill="currentColor" />
                      {bmCount > 1 && (
                        <span className="text-[9px] font-semibold tabular-nums leading-none">
                          {bmCount}
                        </span>
                      )}
                    </span>
                  )}

                  {/* Status icon */}
                  {isChRead ? (
                    <CircleCheck size={12} className="shrink-0 text-success" />
                  ) : ch.status === "generating" ? (
                    <AppLoaderGlyph size={12} className="shrink-0 text-primary" />
                  ) : ch.status === "error" ? (
                    <AlertCircle
                      size={12}
                      className="shrink-0 text-destructive"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Webpages Sidebar ──────────────────────────────────────────

function WebpagesSidebarContent(): React.JSX.Element {
  const [filter, setFilter] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [renameTarget, setRenameTarget] = useState<SavedWebpage | null>(null)
  const [editTarget, setEditTarget] = useState<SavedWebpage | null>(null)

  const webpages = useWebpageStore((s) => s.webpages)
  const isLoaded = useWebpageStore((s) => s.isLoaded)
  const loadWebpages = useWebpageStore((s) => s.loadWebpages)
  const activeWebpageId = useWebpageStore((s) => s.activeWebpageId)
  const selectWebpage = useWebpageStore((s) => s.selectWebpage)
  const removeWebpage = useWebpageStore((s) => s.removeWebpage)
  const updateWebpage = useWebpageStore((s) => s.updateWebpage)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  // Clear book selection when switching to webpages
  const selectBook = useLibraryStore((s) => s.selectBook)

  // Load webpages on first mount
  useEffect(() => {
    if (!isLoaded) loadWebpages()
  }, [isLoaded, loadWebpages])

  const filtered = filter
    ? webpages.filter((w) => w.name.toLowerCase().includes(filter.toLowerCase()))
    : webpages

  const handleRename = (wp: SavedWebpage): void => {
    setRenameTarget(wp)
  }

  const handleEdit = (wp: SavedWebpage): void => {
    setEditTarget(wp)
  }

  const handleRefresh = (wp: SavedWebpage): void => {
    void updateWebpage(wp.id)
  }

  const handleDelete = (wp: SavedWebpage): void => {
    openConfirmDialog({
      title: 'Delete page',
      description: `Are you sure you want to delete "${wp.name}"? This cannot be undone.`,
      onConfirm: () => removeWebpage(wp.id),
    })
  }

  const handleRenameOpenChange = (open: boolean): void => {
    if (!open) setRenameTarget(null)
  }

  const handleEditOpenChange = (open: boolean): void => {
    if (!open) setEditTarget(null)
  }

  return (
    <>
      <PanelHeading icon={Globe} title="Saved Pages" count={webpages.length} className="px-3 h-9">
        <IconButton
          variant="subtle"
          size="sm"
          onClick={() => setShowImport(true)}
          tooltip="Import Webpage"
          tooltipSide="bottom"
          className="size-7 bg-primary/10 hover:bg-primary/20"
        >
          <Plus size={14} strokeWidth={2.5} />
        </IconButton>
      </PanelHeading>

      <div className="px-2.5 py-2">
        <SearchInput placeholder="Search pages…" value={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Globe}
            message={filter ? 'No pages match your search' : 'No saved pages yet — import one to get started'}
            className="py-12"
          />
        ) : (
          <div className="space-y-0.5">
            {filtered.map((wp) => (
              <WebpageSidebarItem
                key={wp.id}
                webpage={wp}
                isActive={wp.id === activeWebpageId}
                onSelect={() => {
                  selectBook(null)
                  selectWebpage(wp.id)
                }}
                onRename={() => handleRename(wp)}
                onEdit={() => handleEdit(wp)}
                onRefresh={() => handleRefresh(wp)}
                onDelete={() => handleDelete(wp)}
              />
            ))}
          </div>
        )}
      </div>

      <ImportWebpageDialog open={showImport} onOpenChange={setShowImport} />
      <RenameWebpageDialog
        webpage={renameTarget}
        open={renameTarget !== null}
        onOpenChange={handleRenameOpenChange}
      />
      <WebpageEditorModal
        webpage={editTarget}
        open={editTarget !== null}
        onOpenChange={handleEditOpenChange}
      />
    </>
  )
}

function WebpageSidebarItem(props: {
  webpage: SavedWebpage
  isActive: boolean
  onSelect: () => void
  onRename: () => void
  onEdit: () => void
  onRefresh: () => void
  onDelete: () => void
}): React.JSX.Element {
  const { webpage, isActive, onSelect, onRename, onEdit, onRefresh, onDelete } = props

  const domain = (() => {
    try {
      return new URL(webpage.url).hostname
    } catch {
      return webpage.url
    }
  })()

  const sizeLabel = (() => {
    const mb = webpage.fileSize / (1024 * 1024)
    if (mb >= 1) return `${mb.toFixed(1)} MB`
    const kb = webpage.fileSize / 1024
    return `${kb.toFixed(0)} KB`
  })()

  return (
    <div
      onClick={onSelect}
      className={`group flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
        isActive
          ? 'bg-muted/50 border border-border/40 text-foreground'
          : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60'
      }`}
    >
      <Globe
        size={14}
        className={`shrink-0 mt-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      />

      <div className="flex-1 min-w-0">
        <span className="block truncate text-xs font-medium leading-snug">
          {webpage.name || domain}
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-muted-foreground/70 truncate">{domain}</span>
          <span className="text-muted-foreground/25 text-[10px]">·</span>
          <span className="text-[10px] text-muted-foreground/60">{sizeLabel}</span>
        </div>
      </div>

      <WebpageItemMenu
        webpage={webpage}
        onRename={onRename}
        onEdit={onEdit}
        onRefresh={onRefresh}
        onDelete={onDelete}
      />
    </div>
  )
}
