import type { HttpMethod } from './APIClient.types'

// ─── Method Colors ───────────────────────────────────────────────

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400',
  POST: 'text-amber-600 dark:text-amber-400',
  PUT: 'text-blue-600 dark:text-blue-400',
  PATCH: 'text-orange-600 dark:text-orange-400',
  DELETE: 'text-red-600 dark:text-red-400',
  HEAD: 'text-purple-600 dark:text-purple-400',
  OPTIONS: 'text-cyan-600 dark:text-cyan-400',
}

export const METHOD_BG_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/20',
  POST: 'bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-400/20',
  PUT: 'bg-blue-400/10 text-blue-600 dark:text-blue-400 border-blue-400/20',
  PATCH: 'bg-orange-400/10 text-orange-600 dark:text-orange-400 border-orange-400/20',
  DELETE: 'bg-red-400/10 text-red-600 dark:text-red-400 border-red-400/20',
  HEAD: 'bg-purple-400/10 text-purple-600 dark:text-purple-400 border-purple-400/20',
  OPTIONS: 'bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border-cyan-400/20',
}

/** Pill-style badge for the hero URL bar method selector */
export const METHOD_PILL_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25',
  POST: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25',
  PUT: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25',
  PATCH: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25',
  HEAD: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25',
  OPTIONS: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25',
}

export const METHOD_DOT_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-emerald-400',
  POST: 'bg-amber-400',
  PUT: 'bg-blue-400',
  PATCH: 'bg-orange-400',
  DELETE: 'bg-red-400',
  HEAD: 'bg-purple-400',
  OPTIONS: 'bg-cyan-400',
}

/** Compact sidebar pill — smaller, denser coloring */
export const METHOD_SIDEBAR_PILL: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  POST: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  PUT: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  PATCH: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
  HEAD: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  OPTIONS: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
}

/** Short 3-letter method abbreviations for compact display */
export const METHOD_SHORT: Record<HttpMethod, string> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PTCH',
  DELETE: 'DEL',
  HEAD: 'HEAD',
  OPTIONS: 'OPT',
}

/** Status badge glow for refined response meta */
export function getStatusGlow(status: number): string {
  if (status >= 200 && status < 300) return 'shadow-[0_0_12px_rgba(52,211,153,0.15)]'
  if (status >= 300 && status < 400) return 'shadow-[0_0_12px_rgba(96,165,250,0.15)]'
  if (status >= 400 && status < 500) return 'shadow-[0_0_12px_rgba(251,191,36,0.15)]'
  return 'shadow-[0_0_12px_rgba(248,113,113,0.15)]'
}

/** Response time quality dot color */
export function getTimingColor(ms: number): string {
  if (ms < 200) return 'bg-emerald-400'
  if (ms < 500) return 'bg-amber-400'
  return 'bg-red-400'
}

export const HTTP_METHODS: HttpMethod[] = [
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
]

// ─── Status Colors ───────────────────────────────────────────────

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-600 dark:text-emerald-400'
  if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400'
  if (status >= 400 && status < 500) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function getStatusBgColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/20'
  if (status >= 300 && status < 400) return 'bg-blue-400/10 text-blue-600 dark:text-blue-400 border-blue-400/20'
  if (status >= 400 && status < 500) return 'bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-400/20'
  return 'bg-red-400/10 text-red-600 dark:text-red-400 border-red-400/20'
}

export function getStatusBarBgColor(status: number): string {
  if (status === 0) return 'bg-red-400/5 border-b-red-400/15'
  if (status >= 200 && status < 300) return 'bg-emerald-400/5 border-b-emerald-400/15'
  if (status >= 300 && status < 400) return 'bg-blue-400/5 border-b-blue-400/15'
  if (status >= 400 && status < 500) return 'bg-amber-400/5 border-b-amber-400/15'
  return 'bg-red-400/5 border-b-red-400/15'
}

// ─── Defaults ────────────────────────────────────────────────────

export const DEFAULT_HEADERS: Array<{ key: string; value: string }> = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Accept', value: 'application/json' },
  { key: 'Authorization', value: 'Bearer ' },
]

export const COLLECTION_COLORS = [
  '', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

// ─── Uncategorized (default catch-all) Collection ────────────────
/** Fixed id for the default catch-all collection so users can create requests without first creating a collection. */
export const UNCATEGORIZED_COLLECTION_ID = 'uncategorized'
export const UNCATEGORIZED_COLLECTION_NAME = 'Uncategorized'
