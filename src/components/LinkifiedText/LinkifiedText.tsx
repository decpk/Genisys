import { useCallback, useMemo } from 'react'
import { ExternalLink, GitPullRequest, Hash } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import { cn } from '@/lib/utils'
import { classifyUrl, type ClassifiedUrl } from '@/lib/classify-url'
import { tokenizeLinks } from '@/lib/linkify-text'

export type LinkifiedTextMode =
  /**
   * Inline anchor — renders the URL in-flow with the surrounding text.
   * Best for narrow / single-line contexts (e.g. task title).
   */
  | 'inline'
  /**
   * Chip — extracts URLs into pill-shaped tokens with an icon + short label.
   * Best for descriptions where URL noise hurts readability.
   */
  | 'chip'
  /**
   * Short anchor — same flow as `inline` but always shortened to
   * `host/…/lastSegment`. Best for tight tooltips / timeline blocks.
   */
  | 'short'

export interface LinkifiedTextProps {
  text: string | null | undefined
  /** Visual density. Defaults to `inline`. */
  mode?: LinkifiedTextMode
  /** Extra classNames for the wrapping span. */
  className?: string
  /**
   * When true, the visible text never exceeds one line — wrapping anchors get
   * truncated via the parent's `line-clamp`. Defaults to false.
   */
  singleLine?: boolean
}

function openExternal(url: string): void {
  // Tauri-only opener; falls back to window.open for web preview environments.
  openUrl(url).catch(() => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // ignore — nothing else we can do
    }
  })
}

function shouldForceBrowser(e: React.MouseEvent): boolean {
  // ⌘ / Ctrl-click forces the system browser even for entity chips that have
  // an in-app deep link, matching the "open in new tab" convention.
  return e.metaKey || e.ctrlKey
}

/**
 * Render plain text with any embedded URLs turned into clickable elements.
 *
 * Behavior:
 * - `chip` mode collapses each URL into a labelled pill (icon + label);
 *   ⌘/Ctrl-click opens in the browser.
 * - `inline` / `short` modes render `<a>` elements in flow. Inline keeps the
 *   full URL as the visible text; `short` always renders the host/path
 *   shortening.
 * - Clicks `stopPropagation` so parent card double-click / context menu /
 *   checkbox handlers remain unaffected.
 *
 * Storage stays plain text — this component is render-time only.
 */
export function LinkifiedText(props: LinkifiedTextProps): React.JSX.Element {
  const { text, mode = 'inline', className, singleLine } = props

  const tokens = useMemo(() => tokenizeLinks(text ?? ''), [text])

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, classified: ClassifiedUrl): void => {
      e.preventDefault()
      e.stopPropagation()
      if (classified.deepLink && !shouldForceBrowser(e)) {
        classified.deepLink()
      } else {
        openExternal(classified.url)
      }
    },
    []
  )

  const handleAnchorMouseDown = useCallback((e: React.MouseEvent<HTMLAnchorElement>): void => {
    // Prevent the parent card's drag/double-click from kicking in before
    // the click handler fires.
    e.stopPropagation()
  }, [])

  // Fast path: no URLs.
  const hasAnyUrl = tokens.some((t) => t.kind === 'url')
  if (!hasAnyUrl) {
    return <span className={className}>{text ?? ''}</span>
  }

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (token.kind === 'text') {
          return <span key={i}>{token.value}</span>
        }
        const classified = classifyUrl(token.href)
        return (
          <LinkAffordance
            key={i}
            mode={mode}
            classified={classified}
            singleLine={singleLine}
            onClick={handleAnchorClick}
            onMouseDown={handleAnchorMouseDown}
          />
        )
      })}
    </span>
  )
}

interface LinkAffordanceProps {
  mode: LinkifiedTextMode
  classified: ClassifiedUrl
  singleLine?: boolean
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, classified: ClassifiedUrl) => void
  onMouseDown: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

function LinkAffordance(props: LinkAffordanceProps): React.JSX.Element {
  const { mode, classified, singleLine, onClick, onMouseDown } = props
  const { kind, label, url, detail } = classified

  const tooltip = detail ? `${url}\n${detail}` : url
  const ariaLabel = classified.deepLink
    ? `Open ${label} in Genisys (⌘-click for browser)`
    : `Open ${url} in browser`

  if (mode === 'chip') {
    const Icon =
      kind === 'ado-pr' ? GitPullRequest : kind === 'ado-workitem' ? Hash : ExternalLink

    return (
      <a
        href={url}
        title={tooltip}
        aria-label={ariaLabel}
        onClick={(e) => onClick(e, classified)}
        onMouseDown={onMouseDown}
        className={cn(
          'inline-flex items-center gap-1 align-middle mx-0.5 my-px',
          'rounded-md px-2 py-[3px]',
          'text-[11px] font-medium leading-none',
          'text-foreground/80',
          'bg-background/50 ring-1 ring-inset ring-border/50',
          'hover:bg-background/80 hover:text-foreground hover:ring-border',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'transition-colors duration-150 cursor-pointer no-underline',
          singleLine && 'max-w-[180px] truncate'
        )}
      >
        <Icon className="size-3 shrink-0 opacity-70" />
        <span className="truncate">{label}</span>
      </a>
    )
  }

  const visibleLabel = mode === 'short' ? classified.label : url

  return (
    <a
      href={url}
      title={tooltip}
      aria-label={ariaLabel}
      onClick={(e) => onClick(e, classified)}
      onMouseDown={onMouseDown}
      className={cn(
        'text-primary underline decoration-primary/40 underline-offset-2',
        'hover:decoration-primary cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm'
      )}
    >
      {visibleLabel}
    </a>
  )
}
