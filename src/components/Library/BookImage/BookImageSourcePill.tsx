import { ExternalLink, WifiOff } from 'lucide-react'

/**
 * Props for the source-attribution pill rendered under a chapter image.
 * `domain` is the host of the image source (e.g. "commons.wikimedia.org"),
 * `url` is the full source URL, and `label` is the publisher name. The
 * pill links out to the original source when `url` is provided.
 */
export interface BookImageSourcePillProps {
  /** Human-readable publisher name (e.g. "Wikimedia Commons"). */
  label?: string
  /** Host of the source URL — shown as a small monospace tag. */
  domain?: string
  /** Full source URL — when present, the pill becomes a clickable link. */
  url?: string
  /** When true, also render a "Offline" indicator. */
  offline?: boolean
}

/**
 * Small attribution pill rendered below a chapter image. Designed to be
 * unobtrusive but discoverable: low-contrast text, hover-highlight, with
 * an external-link icon on the far right when a URL is present.
 */
export function BookImageSourcePill({
  label,
  domain,
  url,
  offline = false,
}: BookImageSourcePillProps) {
  if (!label && !domain && !url) return null

  const displayLabel = label ?? domain ?? 'Source'
  const inner = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/30 text-[11px] text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/50 transition-colors max-w-full">
      <span className="font-medium truncate">Source:</span>
      <span className="truncate">{displayLabel}</span>
      {domain && domain !== displayLabel ? (
        <span className="font-mono text-muted-foreground/50 truncate hidden sm:inline">
          {domain}
        </span>
      ) : null}
      {offline ? (
        <WifiOff size={11} className="text-emerald-600/70 shrink-0" />
      ) : null}
      {url ? <ExternalLink size={11} className="shrink-0 opacity-60" /> : null}
    </span>
  )

  if (!url) {
    return <div className="flex justify-center mt-2">{inner}</div>
  }

  return (
    <div className="flex justify-center mt-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="no-underline"
      >
        {inner}
      </a>
    </div>
  )
}
