import { Compass, Flame, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { BrowserKind } from '@/components/WebLinks/WebLinks.types'

/** Display metadata (label + icon) for a supported browser. */
export interface BrowserMeta {
  /** Human-friendly browser name. */
  label: string
  /** Lucide icon component representing the browser. */
  icon: LucideIcon
}

/** Per-browser display metadata, keyed by `BrowserKind` (lookup map — not a chained ternary). */
const BROWSER_META: Record<BrowserKind, BrowserMeta> = {
  chrome: { label: 'Chrome', icon: Globe },
  edge: { label: 'Edge', icon: Globe },
  brave: { label: 'Brave', icon: Globe },
  arc: { label: 'Arc', icon: Globe },
  firefox: { label: 'Firefox', icon: Flame },
  safari: { label: 'Safari', icon: Compass },
}

/** Resolve a browser id to its display label + icon, falling back to a globe. */
export function getBrowserMeta(browser: BrowserKind): BrowserMeta {
  return BROWSER_META[browser] ?? { label: browser, icon: Globe }
}
