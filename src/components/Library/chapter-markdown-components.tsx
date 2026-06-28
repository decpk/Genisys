import {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
} from 'react'
import {
  BookOpen,
  Copy,
  Check,
  Quote,
  Play,
  Bookmark,
  ImageOff,
  X,
  Maximize2,
} from 'lucide-react'
import type { Components } from 'react-markdown'
import { createHighlighter, type Highlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import { MermaidViewer } from '@/components/MermaidViewer'
import { useLibraryStore } from '@/store/library-store'
import { useSettingsStore, type LibraryInlineImageSize } from '@/store/settings-store'
import { useBookmarkStore } from '@/store/bookmark-store'
import { isExecutable, CodeSandbox } from './sandbox'
import { makeSectionId, slugify as sharedSlugify } from './chapter-highlights'
import { BookImageSourcePill } from './BookImage/BookImageSourcePill'
import { OfflineImageBadge } from './BookImage/OfflineImageBadge'
import { isOfflineImageSrc } from './BookImage/isOfflineImageSrc'
import { parseLibraryImageUri } from './utils/parseLibraryImageUri'

/**
 * Cache of resolved `library-image://...` → `data:` URLs. WKWebView on macOS
 * does not reliably serve our custom URI scheme to `<img>` tags, so we
 * resolve cached images via the Tauri command and feed the resulting data
 * URL into `<img src>`. The map is keyed by the original library-image URL
 * so the same image rendered multiple times in a chapter (or across remounts)
 * only triggers one IPC round-trip.
 */
const libraryImageDataUrlCache = new Map<string, Promise<string | null>>()

const INLINE_IMAGE_WIDTH_CLASS: Record<LibraryInlineImageSize, string> = {
  small: 'max-w-lg',
  medium: 'max-w-2xl',
  large: 'max-w-4xl',
  full: 'max-w-none',
}

function loadLibraryImageDataUrl(src: string): Promise<string | null> {
  const cached = libraryImageDataUrlCache.get(src)
  if (cached) return cached
  const parsed = parseLibraryImageUri(src)
  if (!parsed) return Promise.resolve(null)
  const promise = window.api
    .loadCachedImageAsDataUrl(parsed.bookId, parsed.filename)
    .then((dataUrl) => dataUrl ?? null)
    .catch((err) => {
      console.warn('[BookImage] failed to load cached image', src, err)
      // Drop failed entries from the cache so a later retry (e.g. after
      // re-cache) is allowed instead of permanently sticking to the error.
      libraryImageDataUrlCache.delete(src)
      return null
    })
  libraryImageDataUrlCache.set(src, promise)
  return promise
}

/* ── Shiki highlighter singleton ── */

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['one-dark-pro', 'github-light'],
      langs: [
        'javascript', 'typescript', 'jsx', 'tsx', 'python', 'rust', 'go',
        'java', 'c', 'cpp', 'csharp', 'html', 'css', 'json', 'yaml', 'toml',
        'markdown', 'bash', 'shell', 'sql', 'ruby', 'php', 'swift', 'kotlin',
        'dart', 'lua', 'r', 'scala', 'haskell', 'elixir', 'zig',
      ],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

/* ── Shared dark-mode observer (single MutationObserver for all code blocks) ── */

const darkModeListeners = new Set<() => void>()
let darkModeObserverStarted = false

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

function subscribeDarkMode(cb: () => void): () => void {
  darkModeListeners.add(cb)
  if (!darkModeObserverStarted) {
    darkModeObserverStarted = true
    const observer = new MutationObserver(() => {
      darkModeListeners.forEach((fn) => fn())
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  }
  return () => { darkModeListeners.delete(cb) }
}

export function useDarkMode(): boolean {
  return useSyncExternalStore(subscribeDarkMode, isDarkMode, isDarkMode)
}

/* ── Shiki highlight HTML cache ── */

const shikiHtmlCache = new Map<string, string>()

/* ── Custom markdown components ── */

export const HighlightedCode = memo(function HighlightedCode({
  code,
  lang,
}: {
  code: string
  lang: string
}): React.JSX.Element {
  const isDark = useDarkMode()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const theme = isDark ? 'one-dark-pro' : 'github-light'
  const cacheKey = `${lang}|${theme}|${code}`

  const [prevKey, setPrevKey] = useState(cacheKey)
  const [html, setHtml] = useState<string>(() => shikiHtmlCache.get(cacheKey) ?? "")
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey)
    setHtml(shikiHtmlCache.get(cacheKey) ?? "")
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || shikiHtmlCache.has(cacheKey)) return
    let cancelled = false
    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return
        const supported = highlighter.getLoadedLanguages()
        const useLang = supported.includes(lang) ? lang : 'text'
        if (useLang === 'text') return
        const result = highlighter.codeToHtml(code, { lang: useLang, theme })
        shikiHtmlCache.set(cacheKey, result)
        if (!cancelled) setHtml(result)
      })
      .catch(() => { /* fallback to plain text */ })
    return () => { cancelled = true }
  }, [code, lang, isVisible, cacheKey, theme])

  if (!html) {
    return (
      <div ref={containerRef}>
        <pre className="overflow-x-auto p-4 !m-0 !bg-transparent !border-0 !rounded-none">
          <code className="text-[0.8125em] leading-6">{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:p-4 [&>pre]:!rounded-none [&_code]:!text-[0.8125em] [&_code]:!leading-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})

/* ── Lazy Mermaid wrapper ── */

export const LazyMermaid = memo(function LazyMermaid({ chart }: { chart: string }): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!isVisible) {
    return (
      <div ref={ref} className="my-4 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center" style={{ minHeight: 120 }}>
        <span className="text-xs text-muted-foreground/50">Diagram</span>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <MermaidViewer chart={chart} />
    </div>
  )
})

export const CodeBlock = memo(function CodeBlock({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"code">): React.JSX.Element {
  const match = /language-(\w+)/.exec(className || "")
  const content = String(children).replace(/\n$/, "")
  const isBlock = match || content.includes("\n")

  const [copied, setCopied] = useState(false)
  const [showSandbox, setShowSandbox] = useState(false)
  const [sandboxKey, setSandboxKey] = useState(0)

  if (match?.[1] === 'mermaid') {
    return <LazyMermaid chart={content} />
  }

  if (!isBlock) {
    return (
      <code
        className="text-[0.8125em] font-medium text-primary bg-primary/[0.06] px-1.5 py-0.5 rounded-md border border-primary/[0.08]"
        {...props}
      >
        {children}
      </code>
    )
  }

  const lang = match?.[1] ?? "text"
  const executable = isExecutable(lang)

  const handleCopy = (): void => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = (): void => {
    if (showSandbox) {
      setSandboxKey((k) => k + 1)
    } else {
      setShowSandbox(true)
    }
  }

  return (
    <div className="group/code relative my-4 rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/40">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {lang}
        </span>
        <div className="flex items-center gap-2">
          {executable && (
            <button
              onClick={handleRun}
              className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors cursor-pointer"
            >
              <Play size={10} />
              <span>Run</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            {copied ? (
              <Check size={10} className="text-success" />
            ) : (
              <Copy size={10} />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      {lang !== "text" ? (
        <HighlightedCode code={content} lang={lang} />
      ) : (
        <pre className="overflow-x-auto p-4 !m-0 !bg-transparent !border-0 !rounded-none">
          <code className="text-[0.8125em] leading-6">{children}</code>
        </pre>
      )}
      {executable && showSandbox && (
        <CodeSandbox
          key={sandboxKey}
          code={content}
          lang={lang}
          onClose={() => setShowSandbox(false)}
        />
      )}
    </div>
  );
})

/**
 * Per-block geometry for the persistent "this block is bookmarked" highlight.
 *  - `bar`  → primary-colour vertical accent bar in the left gutter
 *  - `bg`   → subtle primary tint + ring covering the block
 * All overlays are `pointer-events-none` and `aria-hidden`. The negative
 * z-index requires the parent to establish a stacking context (we add the
 * `isolate` class on h2/p/li for that).
 */
const BOOKMARK_OVERLAY_CLASSES = {
  // h2 has `pb-2` + `border-b`; the bg stops above the border so the rule line stays clean.
  heading: {
    bar: 'pointer-events-none absolute -left-3 top-1 bottom-3 w-[2.5px] rounded-full bg-primary',
    bg: 'pointer-events-none absolute -inset-x-2 top-0 bottom-2 -z-10 rounded-md bg-primary/[0.06] ring-1 ring-primary/15',
  },
  // p has `-mx-3 px-3 rounded-lg`, so inset-0 matches its visible (rounded) box.
  paragraph: {
    bar: 'pointer-events-none absolute -left-3 inset-y-1 w-[2.5px] rounded-full bg-primary',
    bg: 'pointer-events-none absolute inset-0 -z-10 rounded-lg bg-primary/[0.06] ring-1 ring-primary/15',
  },
  // li has the same `-mx-3 px-3 rounded-lg` shape with tighter vertical padding.
  item: {
    bar: 'pointer-events-none absolute -left-3 inset-y-0.5 w-[2.5px] rounded-full bg-primary',
    bg: 'pointer-events-none absolute inset-0 -z-10 rounded-lg bg-primary/[0.06] ring-1 ring-primary/15',
  },
} as const

type BookmarkKind = keyof typeof BOOKMARK_OVERLAY_CLASSES

export const BookmarkButton = memo(function BookmarkButton({
  highlightId,
  label,
  size = 16,
  groupClass,
  kind = 'paragraph',
}: {
  highlightId: string
  label: string
  size?: number
  groupClass: string
  kind?: BookmarkKind
}) {
  const isMarked = useBookmarkStore((s) => s.isBookmarked(highlightId))
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark)
  const activeBook = useLibraryStore((s) => s.activeBook)
  const chapterId = useLibraryStore((s) => s.activeChapterId)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!activeBook || !chapterId) return
      toggleBookmark({
        bookId: activeBook.book.id,
        chapterId,
        highlightId,
        label,
      })
    },
    [activeBook, chapterId, toggleBookmark, highlightId, label],
  )

  const pad = size <= 14 ? 'p-1' : 'p-1.5'
  const overlay = BOOKMARK_OVERLAY_CLASSES[kind]

  return (
    <>
      {isMarked && (
        <>
          <span aria-hidden className={overlay.bg} />
          <span aria-hidden className={overlay.bar} />
        </>
      )}
      <button
        onClick={handleClick}
        className={`absolute -left-8 top-1/2 -translate-y-1/2 ${pad} rounded-md transition-all cursor-pointer ${
          isMarked
            ? "text-primary opacity-100"
            : `text-muted-foreground/40 opacity-0 ${groupClass} hover:text-primary hover:bg-primary/10`
        }`}
      >
        <Bookmark size={size} fill={isMarked ? "currentColor" : "none"} />
      </button>
    </>
  )
})

/** Create a slugified ID matching chapter-highlights.ts */
export const slugify = sharedSlugify

/** Extract plain text from React children (for heading IDs) */
export function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText((children as { props: { children?: React.ReactNode } }).props.children)
  }
  return ''
}

/* ── Enhanced image with loading/error/lightbox ── */

export const BookImage = memo(function BookImage({
  src,
  alt,
  sourceUrl,
  sourceDomain,
  sourceLabel,
}: {
  src?: string
  alt?: string
  /** Full URL the image originated from (set by remarkImageSource). */
  sourceUrl?: string
  /** Host of the source URL (set by remarkImageSource). */
  sourceDomain?: string
  /** Human label for the source (set by remarkImageSource). */
  sourceLabel?: string
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [lightbox, setLightbox] = useState(false)
  const inlineImageSize = useSettingsStore((s) => s.libraryInlineImageSize)
  const offline = isOfflineImageSrc(src)
  const imageWidthClass = INLINE_IMAGE_WIDTH_CLASS[inlineImageSize]
  // For offline (library-image://) URLs the WKWebView custom-scheme handler
  // is unreliable, so we resolve the cached bytes to a data: URL via Tauri
  // and feed that into the <img> tag instead. Remote (https) URLs are used
  // verbatim. `effectiveSrc` is what we actually hand to <img>.
  const [effectiveSrc, setEffectiveSrc] = useState<string | undefined>(
    offline ? undefined : src,
  )

  useEffect(() => {
    if (!src) return
    if (!isOfflineImageSrc(src)) {
      setEffectiveSrc(src)
      setStatus('loading')
      return
    }
    let cancelled = false
    setStatus('loading')
    setEffectiveSrc(undefined)
    loadLibraryImageDataUrl(src).then((dataUrl) => {
      if (cancelled) return
      if (dataUrl) {
        setEffectiveSrc(dataUrl)
        // The Tauri command only returns once the bytes are read off disk and
        // base64-encoded, so by the time we get here the data URL is fully
        // valid. We mark loaded immediately to avoid relying on the <img>
        // `onLoad` event, which can be suppressed by browsers when the image
        // sits inside a `display: none` ancestor with `loading="lazy"`.
        setStatus('loaded')
      } else {
        setStatus('error')
      }
    })
    return () => {
      cancelled = true
    }
  }, [src])

  if (!src) return null

  const hasSourceInfo = Boolean(sourceUrl || sourceDomain || sourceLabel)

  return (
    <>
      <figure className={`my-6 group/img mx-auto w-full ${imageWidthClass}`}>
        {status === 'loading' && (
          <div className="w-full aspect-video rounded-xl border border-border/30 bg-muted/20 flex items-center justify-center animate-breathe">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
              <div className="w-10 h-10 rounded-lg bg-muted/40 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <span className="text-[11px] font-medium">Loading image…</span>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="w-full py-8 rounded-xl border border-border/30 bg-muted/10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <ImageOff size={24} />
              <span className="text-[11px] font-medium">Image could not be loaded</span>
              {alt && (
                <span className="text-[11px] text-muted-foreground/50 max-w-sm text-center">
                  {alt}
                </span>
              )}
            </div>
          </div>
        )}
        <div
          className={`relative ${status !== 'loaded' ? 'hidden' : ''} cursor-zoom-in`}
          onClick={() => setLightbox(true)}
        >
          <img
            src={effectiveSrc}
            alt={alt ?? ''}
            className="rounded-xl border border-border/30 shadow-sm w-full"
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {offline ? <OfflineImageBadge /> : null}
          <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
            <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 hover:text-white">
              <Maximize2 size={14} />
            </div>
          </div>
        </div>
        {alt && status !== 'error' && (
          <figcaption className="text-center text-xs text-muted-foreground/60 mt-3 leading-relaxed">
            {alt}
          </figcaption>
        )}
        {hasSourceInfo && status !== 'error' ? (
          <BookImageSourcePill
            label={sourceLabel}
            domain={sourceDomain}
            url={sourceUrl}
            offline={offline}
          />
        ) : null}
      </figure>

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <img
            src={effectiveSrc}
            alt={alt ?? ''}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            referrerPolicy="no-referrer"
          />
          {alt && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-lg text-center text-sm text-white/70 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              {alt}
            </div>
          )}
        </div>
      )}
    </>
  )
})

export function createMarkdownComponents(
  counters: {
    code: number
    blockquote: number
    paragraph: number
    sectionSlugs: Map<string, number>
  },
  showBookmarks: boolean,
): Components {
  return {
    code: CodeBlock as Components["code"],

    blockquote: ({ children }) => {
      const id = `highlight-important-${counters.blockquote++}`
      return (
        <div
          id={id}
          className="my-4 flex gap-3 rounded-xl bg-primary/[0.03] border border-primary/[0.08] px-4 py-3 scroll-mt-20"
        >
          <Quote size={16} className="text-primary/30 shrink-0 mt-0.5" />
          <blockquote className="!border-0 !p-0 !m-0 flex-1 text-muted-foreground [&>p]:!m-0 [&>p]:leading-7">
            {children}
          </blockquote>
        </div>
      )
    },

    h1: ({ children }) => {
      const text = extractText(children)
      if (/^chapter\s+\d+/i.test(text)) return null
      return (
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-10 mb-4 first:mt-0">
          {children}
        </h1>
      )
    },

    h2: ({ children }) => {
      const text = extractText(children)
      const id = makeSectionId(text, counters.sectionSlugs)
      return (
        <h2
          id={id}
          className="group/h2 relative isolate text-xl font-semibold tracking-tight text-foreground mt-10 mb-3 pb-2 border-b border-border/30 first:mt-0 scroll-mt-20"
        >
          {children}
          {showBookmarks && (
            <BookmarkButton highlightId={id} label={text} size={14} groupClass="group-hover/h2:opacity-100" kind="heading" />
          )}
        </h2>
      )
    },

    h3: ({ children }) => {
      const text = extractText(children)
      const id = makeSectionId(text, counters.sectionSlugs)
      return (
        <h3
          id={id}
          className="text-base font-semibold tracking-tight text-foreground mt-7 mb-2.5 scroll-mt-20"
        >
          {children}
        </h3>
      )
    },

    h4: ({ children }) => (
      <h4 className="text-sm font-semibold tracking-tight text-foreground mt-6 mb-2">
        {children}
      </h4>
    ),

    p: ({ children }) => {
      const text = extractText(children)
      if (!text.trim())
        return (
          <p className="leading-[1.75] text-foreground/80 my-3.5 first:mt-0 last:mb-0">
            {children}
          </p>
        )
      const id = `highlight-para-${counters.paragraph++}`
      const label = text.length > 60 ? text.slice(0, 60) + "…" : text
      return (
        <p
          id={id}
          className="group/p relative isolate leading-[1.75] text-foreground/80 my-3.5 first:mt-0 last:mb-0 -mx-3 px-3 py-1 rounded-lg transition-colors duration-150 hover:bg-primary/[0.06] scroll-mt-20"
        >
          {children}
          {showBookmarks && (
            <BookmarkButton highlightId={id} label={label} groupClass="group-hover/p:opacity-100" kind="paragraph" />
          )}
        </p>
      )
    },

    ul: ({ children }) => (
      <ul className="my-3.5 space-y-1.5 pl-1 list-none">{children}</ul>
    ),

    ol: ({ children }) => (
      <ol className="my-3.5 space-y-1.5 pl-1 list-none counter-reset-item">
        {children}
      </ol>
    ),

    li: ({ children }) => {
      const text = extractText(children)
      const id = `highlight-li-${counters.paragraph++}`
      const label = text.length > 60 ? text.slice(0, 60) + "…" : text
      return (
        <li
          id={id}
          className="group/li relative isolate flex gap-2 leading-[1.75] text-foreground/80 -mx-3 px-3 py-0.5 rounded-lg transition-colors duration-150 hover:bg-primary/[0.06]"
        >
          <span className="text-primary/40 shrink-0 mt-[2px] select-none">
            •
          </span>
          <span className="flex-1">{children}</span>
          {showBookmarks && (
            <BookmarkButton highlightId={id} label={label} groupClass="group-hover/li:opacity-100" kind="item" />
          )}
        </li>
      )
    },

    hr: () => (
      <div className="my-7 flex items-center gap-3 justify-center">
        <div className="h-px flex-1 bg-border/40" />
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="w-1 h-1 rounded-full bg-border" />
        </div>
        <div className="h-px flex-1 bg-border/40" />
      </div>
    ),

    table: ({ children }) => (
      <div className="my-4 rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">{children}</table>
        </div>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-muted/50 border-b border-border/40">
        {children}
      </thead>
    ),

    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-foreground/80 border-t border-border/20">
        {children}
      </td>
    ),

    a: ({ children, href }) => (
      <a
        href={href}
        className="text-primary font-medium underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),

    img: ({ src, alt, node }) => {
      // remarkImageSource may have attached source metadata as data-* attrs
      // on the hast node. ReactMarkdown surfaces those via `node.properties`.
      const props = (node as { properties?: Record<string, unknown> } | undefined)
        ?.properties
      const sourceUrl = typeof props?.dataSourceUrl === 'string' ? props.dataSourceUrl : undefined
      const sourceDomain =
        typeof props?.dataSourceDomain === 'string' ? props.dataSourceDomain : undefined
      const sourceLabel =
        typeof props?.dataSourceLabel === 'string' ? props.dataSourceLabel : undefined
      return (
        <BookImage
          src={src}
          alt={alt}
          sourceUrl={sourceUrl}
          sourceDomain={sourceDomain}
          sourceLabel={sourceLabel}
        />
      )
    },

    pre: ({ children }) => {
      const child = children as
        | React.ReactElement<{ className?: string }>
        | undefined
      const lang = child?.props?.className
        ? (/language-(\w+)/.exec(child.props.className)?.[1] ?? "")
        : ""
      const idx = counters.code++
      const id =
        lang === "mermaid"
          ? `highlight-mermaid-${idx}`
          : lang && lang !== "text"
            ? `highlight-code-${idx}`
            : undefined
      return (
        <div id={id} className="scroll-mt-20">
          {children}
        </div>
      )
    },
  }
}
