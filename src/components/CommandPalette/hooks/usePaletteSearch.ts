import Fuse from 'fuse.js'
import { useMemo } from 'react'

import {
  EMPTY_GROUP_LIMIT,
  FUSE_KEYS,
  FUSE_THRESHOLD,
  KIND_CONFIG,
  MAX_RESULTS,
} from '../CommandPalette.constants'
import type {
  PaletteItem,
  PaletteKind,
  PaletteMode,
  RecentEntry,
} from '../CommandPalette.types'

interface UsePaletteSearchInput {
  allItems: PaletteItem[]
  mode: PaletteMode
  kindFilter: PaletteKind | null
  cleanedQuery: string
  recents: RecentEntry[]
}

interface UsePaletteSearchResult {
  results: PaletteItem[]
  firstNonRecentIndex: number
}

function filterByMode(items: PaletteItem[], mode: PaletteMode): PaletteItem[] {
  if (mode === 'commands') {
    return items.filter((it) => KIND_CONFIG[it.kind]?.inCommands)
  }
  return items.filter((it) => KIND_CONFIG[it.kind]?.inQuickOpen)
}

function emptyQueryResults(items: PaletteItem[], recentIds: Map<string, number>): PaletteItem[] {
  const recentItems: PaletteItem[] = []
  const restByGroup = new Map<string, PaletteItem[]>()

  for (const item of items) {
    if (recentIds.has(item.id)) {
      recentItems.push(item)
      continue
    }
    const list = restByGroup.get(item.group) ?? []
    if (list.length < EMPTY_GROUP_LIMIT) {
      list.push(item)
      restByGroup.set(item.group, list)
    }
  }

  recentItems.sort((a, b) => (recentIds.get(b.id) ?? 0) - (recentIds.get(a.id) ?? 0))

  const out: PaletteItem[] = [...recentItems]
  for (const list of restByGroup.values()) {
    out.push(...list)
  }
  return out.slice(0, MAX_RESULTS)
}

function searchResults(
  items: PaletteItem[],
  query: string,
  recentIds: Map<string, number>,
): PaletteItem[] {
  const fuse = new Fuse(items, {
    keys: FUSE_KEYS as unknown as string[],
    threshold: FUSE_THRESHOLD,
    includeScore: true,
    ignoreLocation: true,
  })
  const matched = fuse.search(query, { limit: MAX_RESULTS })
  const sorted = matched.slice().sort((a, b) => {
    const aRecent = recentIds.has(a.item.id)
    const bRecent = recentIds.has(b.item.id)
    if (aRecent && !bRecent) return -1
    if (!aRecent && bRecent) return 1
    return (a.score ?? 0) - (b.score ?? 0)
  })
  return sorted.map((r) => r.item)
}

export function usePaletteSearch(input: UsePaletteSearchInput): UsePaletteSearchResult {
  const { allItems, mode, kindFilter, cleanedQuery, recents } = input

  const recentIds = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of recents) map.set(r.id, r.ts)
    return map
  }, [recents])

  const filtered = useMemo(() => {
    let items = filterByMode(allItems, mode)
    if (kindFilter) items = items.filter((it) => it.kind === kindFilter)
    return items
  }, [allItems, mode, kindFilter])

  const results = useMemo(() => {
    if (!cleanedQuery) return emptyQueryResults(filtered, recentIds)
    return searchResults(filtered, cleanedQuery, recentIds)
  }, [filtered, cleanedQuery, recentIds])

  const firstNonRecentIndex = useMemo(() => {
    let i = 0
    while (i < results.length && recentIds.has(results[i].id)) i++
    return i
  }, [results, recentIds])

  return { results, firstNonRecentIndex }
}
