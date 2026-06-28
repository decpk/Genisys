import type { SavedPreview } from '@/components/WebLinks/WebLinks.types'

/**
 * Visual treatment for a saved-preview card's hero region.
 *
 * Every card is given a deterministic, branded banner so collections stay
 * differentiable even when a page exposes no social image (the common case for
 * auth-walled internal sites). `imageUrl` is preferred when present; the synth
 * fields are always computed so the card can fall back to them if that image
 * fails to load.
 */
export interface CardVisual {
  /** The page's `og:image`/`twitter:image`, or '' when none was captured. */
  imageUrl: string
  /** CSS `background` (a gradient) for the synthesized banner. */
  background: string
  /** 1–2 letter monogram drawn on the synthesized banner. */
  monogram: string
  /** Favicon URL to overlay on the banner, or '' when none. */
  faviconUrl: string
}

/** Deterministic djb2 string hash → unsigned 32-bit int. */
function hashString(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return hash >>> 0
}

/** The registrable-ish hostname (sans leading `www.`) for a saved preview. */
function getHostname(preview: SavedPreview): string {
  const source = preview.finalUrl || preview.url
  try {
    return new URL(source).hostname.replace(/^www\./, '')
  } catch {
    return source
  }
}

/** Parse a `#rgb`/`#rrggbb` string into 0–255 channels, or null when invalid. */
function parseHex(value: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (!match) return null
  let hex = match[1]
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = Number.parseInt(hex, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

/**
 * Hue (0–359) of a hex color, or null for invalid/greyscale values (which carry
 * no meaningful hue and should fall back to the hostname hash).
 */
function hueFromHex(value: string): number | null {
  const rgb = parseHex(value)
  if (!rgb) return null
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return null
  let hue: number
  if (max === r) hue = ((g - b) / delta) % 6
  else if (max === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4
  hue = Math.round(hue * 60)
  return hue < 0 ? hue + 360 : hue
}

/**
 * 1–2 letter monogram. Prefers the page title (so same-domain pages differ),
 * falling back to the site name, then the hostname.
 */
function getMonogram(preview: SavedPreview, hostname: string): string {
  const basis = (preview.title || preview.siteName || hostname).trim()
  if (!basis) return '?'
  const words = basis.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return basis.slice(0, 2).toUpperCase()
}

/**
 * Derive the card's hero visual from a saved preview.
 *
 * Hue comes from the brand `themeColor` when it carries one, else from a hash of
 * the hostname (so a domain keeps a stable colour). Saturation/lightness are
 * fixed for a cohesive grid and good white-on-banner contrast; the gradient
 * angle and second stop are nudged by a hash of the full URL so distinct pages
 * on the same domain still look distinct.
 */
export function getCardVisual(preview: SavedPreview): CardVisual {
  const hostname = getHostname(preview)
  const hue = hueFromHex(preview.themeColor) ?? hashString(hostname) % 360
  const urlHash = hashString(preview.finalUrl || preview.url)
  const hue2 = (hue + 24 + (urlHash % 24)) % 360
  const angle = 120 + (urlHash % 60)
  const background = `linear-gradient(${angle}deg, hsl(${hue} 64% 52%), hsl(${hue2} 60% 42%))`

  return {
    imageUrl: preview.imageUrl,
    background,
    monogram: getMonogram(preview, hostname),
    faviconUrl: preview.faviconUrl,
  }
}
