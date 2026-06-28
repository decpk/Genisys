import { useCallback, useMemo } from 'react'
import { ExternalLink, GitPullRequest, Hash } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import { cn } from '@/lib/utils'
import { classifyUrl, type ClassifiedUrl } from '@/lib/classify-url'
import { tokenizeLinks } from '@/lib/linkify-text'

export interface LinkRailProps {
  /** Source text to scan for URLs. */
  text: string | null | undefined
  /** Extra classes for the wrapper. */
  className?: string
  /** Optional label prefix (e.g. "Links"). Hidden when omitted. */
  label?: string
}

function openExternal(url: string): void {
  openUrl(url).catch(() => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // ignore
    }
  })
}

function shouldForceBrowser(e: React.MouseEvent): boolean {
  return e.metaKey || e.ctrlKey
}

/**
 * Render a horizontal rail of clickable chips for every unique URL embedded
 * in `text`. Designed to live below a description that already shows the URL
 * inline as plain text — so users get both the readable context *and* a
 * dedicated, prominent affordance to open the link.
 *
 * - URLs render as labelled `↗ host/…/lastSegment` chips with an icon and
 *   open externally; ⌘/Ctrl-click opens in the browser.
 * - Renders nothing when the text has no URLs (and contributes no DOM /
 *   margins in that case).
 */
export function LinkRail(props: LinkRailProps): React.JSX.Element | null {
  const { text, className, label } = props

  const classifiedLinks = useMemo<ClassifiedUrl[]>(() => {
    if (!text) return []
    const seen = new Set<string>()
    const out: ClassifiedUrl[] = []
    for (const token of tokenizeLinks(text)) {
      if (token.kind !== 'url') continue
      if (seen.has(token.href)) continue
      seen.add(token.href)
      out.push(classifyUrl(token.href))
    }
    return out
  }, [text])

  const handleClick = useCallback(
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

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.stopPropagation()
  }, [])

  if (classifiedLinks.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {label && (
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 mr-0.5">
          {label}
        </span>
      )}
      {classifiedLinks.map((classified) => {
        const Icon =
          classified.kind === 'ado-pr'
            ? GitPullRequest
            : classified.kind === 'ado-workitem'
            ? Hash
            : ExternalLink
        const tooltip = classified.detail
          ? `${classified.url}\n${classified.detail}`
          : classified.url
        const ariaLabel = classified.deepLink
          ? `Open ${classified.label} in Genisys (⌘-click for browser)`
          : `Open ${classified.url} in browser`

        return (
          <a
            key={classified.url}
            href={classified.url}
            title={tooltip}
            aria-label={ariaLabel}
            onClick={(e) => handleClick(e, classified)}
            onMouseDown={handleMouseDown}
            className={cn(
              'inline-flex items-center gap-1 max-w-[220px]',
              'rounded-md px-2 py-1',
              'text-[11px] font-medium leading-none',
              'text-foreground/85',
              'bg-background/60 ring-1 ring-inset ring-border/50',
              'hover:bg-background hover:text-foreground hover:ring-border',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'transition-colors duration-150 cursor-pointer no-underline'
            )}
          >
            <Icon className="size-3 shrink-0 opacity-70" />
            <span className="truncate">{classified.label}</span>
          </a>
        )
      })}
    </div>
  )
}
