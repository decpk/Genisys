import {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
  Pencil,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { Tooltip } from '@/components/Tooltip'
import { SpeakerButton } from '@/components/TextToSpeech'
import { useLibraryStore, type Chapter } from '@/store/library-store'
import { useSettingsStore } from '@/store/settings-store'
import { registerEditorToggle } from '@/store/panel-toggle-registry'
import { FONT_CONFIG, FONT_OPTIONS } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import {
  CONTENT_WIDTH_OPTIONS,
  getContentWidthClasses,
  getContentWidthLabel,
} from '@/lib/content-width'
import { extractHighlights } from './chapter-highlights'
import { useChapterToc } from './ChapterTocContext'
import { useChapterSearch } from './ChapterSearchContext'
import { splitContentIntoSegments } from './quiz-parser'
import { QuizSection } from './QuizSection'
import { ChallengeSection } from './ChallengeSection'
import { useBookmarkStore } from '@/store/bookmark-store'
import { BookmarkResumePopup } from './BookmarkResumePopup'
import { ChapterExportMenu } from "./ChapterExportMenu"
import { ChapterLanguageDropdown } from './ChapterLanguageDropdown'
import { ChapterLanguagePills } from './ChapterLanguagePills'
import { useChapterLanguageData } from './hooks/useChapterLanguageData'
import { useChapterImageBackfill } from './hooks/useChapterImageBackfill'
import { useScrollDirection } from './hooks/useScrollDirection'
import { AppLoaderGlyph } from "@/components/AppLoader";
import { getLanguageLabel } from "@/lib/getLanguageLabel";
import { createMarkdownComponents } from './chapter-markdown-components'
import { ChapterEditorModal } from './ChapterEditorModal'
import { useLibraryAIContext } from './LibraryAIContext'
import { LibraryMarkdown } from './LibraryMarkdown'

interface ChapterViewerProps {
  chapter: Chapter
  bookTitle: string
}

/* ── Main component ── */

export function ChapterViewer({ chapter, bookTitle }: ChapterViewerProps): React.JSX.Element {
  const activeBook = useLibraryStore((s) => s.activeBook)
  const selectChapter = useLibraryStore((s) => s.selectChapter)
  const toggleChapterRead = useLibraryStore((s) => s.toggleChapterRead)
  const contentWidth = useSettingsStore((s) => s.libraryContentWidth)
  const setContentWidth = useSettingsStore((s) => s.setLibraryContentWidth)
  const readingFont = useSettingsStore((s) => s.libraryReadingFont)
  const setReadingFont = useSettingsStore((s) => s.setLibraryReadingFont)
  const showScrollPercentage = useSettingsStore((s) => s.showScrollPercentage)
  const showScrollProgressBar = useSettingsStore((s) => s.showScrollProgressBar)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { setHighlights, setActiveHighlightId, setScrollProgress, registerProgressBarRef, registerPercentLabelRef, registerScrollRef } = useChapterToc()
  const { registerScrollRef: registerSearchScrollRef, clearSearch } = useChapterSearch()

  // ── AI context: text selection → context item ──
  const { addSelectionToContext } = useLibraryAIContext()

  const handleContentMouseUp = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim() ?? ''
    if (text.length >= 10) {
      addSelectionToContext(text, chapter.title)
    }
  }, [addSelectionToContext, chapter.title])

  // ── Chapter editor modal ──
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // ── Distraction-free ──
  const distractionFree = useLibraryStore((s) => s.distractionFree)
  const toggleDistractionFree = useLibraryStore((s) => s.toggleDistractionFree)
  const dfHideHeader = useSettingsStore((s) => s.libraryDFHideHeader)
  const dfHideBottomNav = useSettingsStore((s) => s.libraryDFHideBottomNav)
  const dfShowHeaderOnHover = useSettingsStore((s) => s.libraryDFShowHeaderOnHover)
  const [headerHovered, setHeaderHovered] = useState(false)
  const showHeader = !distractionFree || !dfHideHeader || (dfShowHeaderOnHover && headerHovered)
  const showBottomNav = !distractionFree || !dfHideBottomNav

  const handleHeaderHoverZone = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (distractionFree && dfHideHeader && dfShowHeaderOnHover) {
      const rect = e.currentTarget.getBoundingClientRect()
      setHeaderHovered(e.clientY - rect.top < 48)
    }
  }, [distractionFree, dfHideHeader, dfShowHeaderOnHover])

  const handleHeaderMouseLeave = useCallback(() => {
    setHeaderHovered(false)
  }, [])

  // Register editor toggle for keyboard shortcut
  useEffect(() => {
    return registerEditorToggle(() => setIsEditorOpen(true))
  }, [])
  // ── Bookmarks ──
  const loadChapterBookmarks = useBookmarkStore((s) => s.loadChapterBookmarks)

  useEffect(() => {
    loadChapterBookmarks(chapter.id)
  }, [chapter.id, loadChapterBookmarks])

  // Language-aware reading state (multi-version translations)
  const {
    activeLanguage,
    displayContent,
    translations,
    isTranslating,
    selectLanguage,
    translateChapter,
    translateBook,
    deleteTranslation,
  } = useChapterLanguageData(chapter);
  // Backfill: when a chapter opens, check if it still references any remote
  // image URLs and quietly cache them in the background. No-op when caching
  // is disabled or every image already lives in the offline cache.
  useChapterImageBackfill(
    activeBook && displayContent && chapter.status === 'completed'
      ? { bookId: activeBook.book.id, chapterId: chapter.id, markdown: displayContent }
      : null,
  )
  const scrollDirection = useScrollDirection(scrollRef)
  const pillsVisible = scrollDirection === 'up'
  const highlights = useMemo(() => extractHighlights(displayContent), [displayContent])

  const segments = useMemo(
    () => (displayContent ? splitContentIntoSegments(displayContent) : []),
    [displayContent]
  )

  // Push highlights to context for the right panel
  useEffect(() => {
    setHighlights(highlights)
  }, [highlights, setHighlights])

  // Register scroll ref with context so the right panel can trigger scrolling
  useEffect(() => {
    registerScrollRef(scrollRef.current)
    return () => registerScrollRef(null)
  }, [registerScrollRef])

  // Register scroll ref with search context
  useEffect(() => {
    registerSearchScrollRef(scrollRef.current)
    return () => registerSearchScrollRef(null)
  }, [registerSearchScrollRef])

  // Track scroll progress via rAF (lightweight – no DOM queries)
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const maxScroll = scrollHeight - clientHeight
        setScrollProgress(maxScroll > 0 ? scrollTop / maxScroll : 0)
      })
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [setScrollProgress])

  // Track active highlight via IntersectionObserver (no per-frame DOM queries)
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || highlights.length === 0) return

    const ids = highlights.map((h) => h.id)
    // Set of highlight IDs currently visible in the viewport
    const visibleIds = new Set<string>()
    let lastActiveId: string | null = ids[0] // default to first heading

    // Set initial active heading immediately so TOC starts highlighted
    setActiveHighlightId(ids[0])

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting) {
            visibleIds.add(id)
          } else {
            visibleIds.delete(id)
          }
        }
        // Pick the last visible highlight in document order (topmost that scrolled past threshold)
        let activeId: string | null = null
        for (const id of ids) {
          if (visibleIds.has(id)) activeId = id
        }

        if (activeId) {
          // A heading is in the detection zone — update normally
          lastActiveId = activeId
          setActiveHighlightId(activeId)
        } else if (scrollContainer.scrollTop <= 10) {
          // Scrolled to top — default to first heading
          lastActiveId = ids[0]
          setActiveHighlightId(ids[0])
        } else {
          // Between headings — retain the last known active heading
          setActiveHighlightId(lastActiveId)
        }
      },
      {
        root: scrollContainer,
        // Trigger when element enters top 120px of the container
        rootMargin: '0px 0px -80% 0px',
        threshold: 0,
      }
    )

    // Observe all highlight elements
    const elements: Element[] = []
    for (const id of ids) {
      const el = scrollContainer.querySelector(`#${CSS.escape(id)}`)
      if (el) {
        observer.observe(el)
        elements.push(el)
      }
    }

    return () => observer.disconnect()
  }, [highlights, chapter.id, setActiveHighlightId])

  // Create markdown components with ID-assigning counters (reset per render cycle)
  const mdComponents = useMemo(() => {
    const counters = {
      code: 0,
      blockquote: 0,
      paragraph: 0,
      sectionSlugs: new Map<string, number>(),
    };
    return createMarkdownComponents(counters, true)
  }, [chapter.id])

  const { prevChapter, nextChapter } = useMemo(() => {
    if (!activeBook) return { prevChapter: null, nextChapter: null }
    const idx = activeBook.chapters.findIndex((c) => c.id === chapter.id)
    return {
      prevChapter: idx > 0 ? activeBook.chapters[idx - 1] : null,
      nextChapter: idx < activeBook.chapters.length - 1 ? activeBook.chapters[idx + 1] : null,
    }
  }, [activeBook, chapter.id])

  const totalChapters = activeBook?.chapters.length ?? 0
  const currentIndex = activeBook?.chapters.findIndex((c) => c.id === chapter.id) ?? 0

  // Reset scroll & progress when chapter changes
  useEffect(() => {
    setScrollProgress(0)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [chapter.id, setScrollProgress]);

  // Clear search when chapter changes
  useEffect(() => {
    clearSearch()
  }, [chapter.id, clearSearch])

  const headerBtnBase =
    'inline-flex items-center justify-center h-7 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer border'
  const headerBtnIdle =
    'bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground'

  return (
    <div
      className="relative flex flex-col h-full bg-background"
      onMouseMove={distractionFree ? handleHeaderHoverZone : undefined}
      onMouseLeave={distractionFree ? handleHeaderMouseLeave : undefined}
    >
      {/* Header */}
      <div
        className={`shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md z-10 transition-all duration-200 ${
          showHeader
            ? "max-h-12 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden border-b-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4 h-11 px-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 min-w-0">
            <Tooltip content="Back to book" side="bottom">
              <button
                onClick={() => selectChapter(null)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary/8 shrink-0 cursor-pointer hover:bg-primary/15 transition-colors"
              >
                <ArrowLeft size={13} className="text-primary" />
              </button>
            </Tooltip>

            <button
              onClick={() => selectChapter(null)}
              className="text-[12px] text-muted-foreground truncate hover:text-foreground transition-colors cursor-pointer max-w-[200px] sm:max-w-[280px] leading-none"
            >
              {bookTitle}
            </button>

            <span className="text-muted-foreground/25 shrink-0 text-sm select-none">
              /
            </span>

            <span className="text-[12px] font-medium text-foreground truncate max-w-[180px] sm:max-w-[320px] leading-none">
              Ch. {chapter.chapterNumber} — {chapter.title}
            </span>
          </nav>

          {/* Toolbar */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language switcher */}
            <ChapterLanguageDropdown
              chapter={chapter}
              activeLanguage={activeLanguage}
              translations={translations}
              onSelectLanguage={selectLanguage}
              onTranslateChapter={translateChapter}
              onTranslateBook={translateBook}
              onDeleteTranslation={deleteTranslation}
            />

            {/* Export */}
            <ChapterExportMenu chapter={chapter} bookTitle={bookTitle} />

            {/* Mark as read */}
            <Tooltip
              content={chapter.isRead ? "Mark as unread" : "Mark as read"}
              side="bottom"
            >
              <button
                onClick={() => toggleChapterRead(chapter.id, !chapter.isRead)}
                className={`${headerBtnBase} w-7 ${
                  chapter.isRead
                    ? "bg-success/10 text-success border-success/20 hover:bg-success/15"
                    : headerBtnIdle
                }`}
              >
                <Check size={13} />
              </button>
            </Tooltip>

            {/* Divider */}
            <div className="w-px h-4 bg-border/40 mx-0.5" />

            {/* Font picker */}
            <DropdownMenu>
              <Tooltip content="Reading font" side="bottom">
                <DropdownMenuTrigger asChild>
                  <button
                    className={`${headerBtnBase} px-2 gap-1 ${headerBtnIdle}`}
                  >
                    <span
                      className="text-[12px]"
                      style={{ fontFamily: FONT_CONFIG[readingFont].family }}
                    >
                      Aa
                    </span>
                    <ChevronDown size={10} className="opacity-50" />
                  </button>
                </DropdownMenuTrigger>
              </Tooltip>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="z-50 min-w-[130px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
              >
                {FONT_OPTIONS.map((f) => (
                  <DropdownMenuItem
                    key={f}
                    onSelect={() => setReadingFont(f)}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors ${
                      readingFont === f
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-secondary"
                    }`}
                  >
                    <span style={{ fontFamily: FONT_CONFIG[f].family }}>
                      {FONT_CONFIG[f].label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Width picker */}
            <DropdownMenu>
              <Tooltip content="Content width" side="bottom">
                <DropdownMenuTrigger asChild>
                  <button
                    className={`${headerBtnBase} px-2 gap-1 ${headerBtnIdle}`}
                  >
                    <span>{getContentWidthLabel(contentWidth)}</span>
                    <ChevronDown size={10} className="opacity-50" />
                  </button>
                </DropdownMenuTrigger>
              </Tooltip>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="z-50 min-w-[120px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
              >
                {CONTENT_WIDTH_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => setContentWidth(option.value)}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors ${
                      contentWidth === option.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-secondary"
                    }`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Distraction-free toggle */}
            <SpeakerButton
              text={displayContent}
              size={13}
              className={`${headerBtnBase} w-7 ${headerBtnIdle}`}
            />
            <Tooltip
              content={
                distractionFree
                  ? "Exit distraction-free (⇧⌘F)"
                  : "Distraction-free reading (⇧⌘F)"
              }
              side="bottom"
            >
              <button
                onClick={toggleDistractionFree}
                className={`${headerBtnBase} w-7 ${
                  distractionFree
                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                    : headerBtnIdle
                }`}
              >
                {distractionFree ? (
                  <Minimize2 size={13} />
                ) : (
                  <Maximize2 size={13} />
                )}
              </button>
            </Tooltip>

            {/* Edit chapter */}
            {chapter.status === "completed" && (
              <>
                <div className="w-px h-4 bg-border/40 mx-0.5" />
                <Tooltip content="Edit chapter" side="bottom">
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className={`${headerBtnBase} w-7 ${headerBtnIdle}`}
                  >
                    <Pencil size={13} />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll progress bar */}
      {(showScrollProgressBar || showScrollPercentage) && (
        <div className={cn("shrink-0 h-[3px] relative", showScrollProgressBar && "bg-border/20")}>
          {showScrollProgressBar && (
            <div
              ref={registerProgressBarRef}
              className="absolute inset-y-0 left-0 bg-primary/70 transition-none"
              style={{ width: "0%" }}
            />
          )}
          {showScrollPercentage && (
            <div
              ref={registerPercentLabelRef}
              className="pointer-events-none absolute top-full mt-1 -translate-x-1/2 z-10 w-fit whitespace-nowrap rounded-full px-2 py-1.5 text-[10px] font-semibold leading-none tabular-nums bg-primary text-primary-foreground shadow-sm opacity-0 transition-opacity duration-500"
              style={{ left: 0 }}
            >
              0%
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        onMouseUp={handleContentMouseUp}
      >
        <article
          className={cn('mx-auto px-8 pt-2 pb-8 lg:px-12', getContentWidthClasses(contentWidth).maxWidth, getContentWidthClasses(contentWidth).paddingX)}
          style={{ fontFamily: FONT_CONFIG[readingFont].family }}
        >
          {/* Floating language pills (auto-hide on scroll-down) */}
          <ChapterLanguagePills
            chapter={chapter}
            activeLanguage={activeLanguage}
            translations={translations}
            visible={pillsVisible}
            onSelectLanguage={selectLanguage}
            onTranslateChapter={translateChapter}
            onTranslateBook={translateBook}
            onDeleteTranslation={deleteTranslation}
          />
          {/* Chapter hero */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-primary bg-primary/[0.07] px-3 py-1 rounded-full border border-primary/10 tracking-wide">
                Chapter {chapter.chapterNumber}
              </span>
              {totalChapters > 0 && (
                <>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                  <span className="text-[11px] text-muted-foreground/50">
                    {currentIndex + 1} of {totalChapters}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-[1.2]">
              {chapter.title}
            </h1>
            <div className="mt-4 h-px bg-gradient-to-r from-primary/20 via-border/40 to-transparent" />
          </div>

          {isTranslating && !displayContent ? (
            <div className="mt-14 flex flex-col items-center gap-3 text-center">
              <AppLoaderGlyph size={28} />
              <p className="text-sm text-muted-foreground/70">
                Translating to {getLanguageLabel(activeLanguage)}…
              </p>
            </div>
          ) : displayContent ? (
            <div className="max-w-none">
              {segments.map((seg, i) =>
                seg.type === "markdown" ? (
                  <LibraryMarkdown
                    key={i}
                    content={seg.content}
                    components={mdComponents}
                    isStreaming={chapter.status === "generating"}
                  />
                ) : seg.type === "quiz" ? (
                  <QuizSection
                    key={i}
                    title={seg.title}
                    questions={seg.questions}
                  />
                ) : seg.type === "challenge" ? (
                  <ChallengeSection key={i} challenges={seg.challenges} />
                ) : null,
              )}
            </div>
          ) : (
            <div className="mt-14 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-muted/30 border border-border/30 flex items-center justify-center">
                <BookOpen size={24} className="text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground/70">
                {chapter.status === "generating"
                  ? "This chapter is being generated…"
                  : chapter.status === "error"
                    ? "Failed to generate this chapter."
                    : "This chapter has no content yet."}
              </p>
            </div>
          )}

          {/* Bottom spacer for sticky nav */}
          <div className="h-14" />
        </article>
      </div>

      {/* Bookmark resume popup */}
      <BookmarkResumePopup chapterId={chapter.id} />

      {/* Sticky bottom navigation */}
      {showBottomNav && (prevChapter || nextChapter) && (
        <div className="shrink-0 border-t border-border/50 bg-background/90 backdrop-blur-md z-10">
          <div className="flex items-center justify-between px-4 py-2 gap-2">
            {prevChapter ? (
              <button
                onClick={() => selectChapter(prevChapter.id)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer min-w-0 max-w-[45%]"
              >
                <ArrowLeft
                  size={13}
                  className="shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:-translate-x-0.5 transition-all"
                />
                <div className="min-w-0 text-left">
                  <span className="block text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium leading-none mb-0.5">
                    Prev
                  </span>
                  <span className="block text-xs text-foreground/70 group-hover:text-primary truncate transition-colors">
                    {prevChapter.title}
                  </span>
                </div>
              </button>
            ) : (
              <div />
            )}
            <span className="text-[10px] text-muted-foreground/30 shrink-0">
              {currentIndex + 1}/{totalChapters}
            </span>
            {nextChapter ? (
              <button
                onClick={() => selectChapter(nextChapter.id)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer min-w-0 max-w-[45%]"
              >
                <div className="min-w-0 text-right">
                  <span className="block text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium leading-none mb-0.5">
                    Next
                  </span>
                  <span className="block text-xs text-foreground/70 group-hover:text-primary truncate transition-colors">
                    {nextChapter.title}
                  </span>
                </div>
                <ArrowRight
                  size={13}
                  className="shrink-0 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Chapter editor modal */}
      {activeBook && (
        <ChapterEditorModal
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          chapter={chapter}
          bookId={activeBook.book.id}
        />
      )}
    </div>
  );
}
