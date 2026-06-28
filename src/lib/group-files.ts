import type { FilesSortBy, FilesGroupBy, CustomGroupRule } from '@/store/settings-store'

// ── Sorting ──────────────────────────────────────────────────────────

const CHANGE_TYPE_ORDER: Record<string, number> = { add: 0, edit: 1, rename: 2, delete: 3 }

function getChangeTypeOrder(changeType: string): number {
  return CHANGE_TYPE_ORDER[changeType] ?? 99
}

export function sortFiles<T>(
  items: T[],
  getPath: (item: T) => string,
  getChangeType: (item: T) => string,
  sortBy: FilesSortBy
): T[] {
  const sorted = [...items]
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': {
        const nameA = getPath(a).split('/').pop() || ''
        const nameB = getPath(b).split('/').pop() || ''
        return nameA.localeCompare(nameB)
      }
      case 'name-desc': {
        const nameA = getPath(a).split('/').pop() || ''
        const nameB = getPath(b).split('/').pop() || ''
        return nameB.localeCompare(nameA)
      }
      case 'path-asc':
        return getPath(a).localeCompare(getPath(b))
      case 'path-desc':
        return getPath(b).localeCompare(getPath(a))
      case 'type': {
        const diff = getChangeTypeOrder(getChangeType(a)) - getChangeTypeOrder(getChangeType(b))
        if (diff !== 0) return diff
        const nameA = getPath(a).split('/').pop() || ''
        const nameB = getPath(b).split('/').pop() || ''
        return nameA.localeCompare(nameB)
      }
    }
  })
  return sorted
}

// ── Grouping ─────────────────────────────────────────────────────────

export interface FileGroup<T> {
  label: string
  files: T[]
}

function getExtension(path: string): string {
  const name = path.split('/').pop() || ''
  const dotIndex = name.lastIndexOf('.')
  return dotIndex > 0 ? name.slice(dotIndex) : '(no extension)'
}

function getDirectory(path: string): string {
  const parts = path.split('/')
  return parts.length > 1 ? parts.slice(0, -1).join('/') : '/'
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  add: 'Added',
  edit: 'Modified',
  rename: 'Renamed',
  delete: 'Deleted'
}

/**
 * Converts a simple glob pattern to a RegExp.
 * Supports: * (any chars), ? (single char), character groups like (a|b|c).
 * The pattern is matched against the file name (not the full path).
 */
function globToRegex(pattern: string): RegExp {
  let regex = ''
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]
    switch (ch) {
      case '*':
        regex += '.*'
        break
      case '?':
        regex += '.'
        break
      case '.':
        regex += '\\.'
        break
      case '(':
      case ')':
      case '|':
        regex += ch
        break
      default:
        regex += ch
    }
  }
  return new RegExp(`^${regex}$`, 'i')
}

function matchCustomRule(path: string, rules: CustomGroupRule[]): string {
  const fileName = path.split('/').pop() || ''
  for (const rule of rules) {
    if (!rule.pattern || !rule.group) continue

    const includePatterns = rule.pattern
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    const isIncluded = includePatterns.some((p) => {
      try {
        return globToRegex(p).test(fileName)
      } catch {
        return false
      }
    })
    if (!isIncluded) continue

    if (rule.excludePattern) {
      const excludePatterns = rule.excludePattern
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
      const isExcluded = excludePatterns.some((p) => {
        try {
          return globToRegex(p).test(fileName)
        } catch {
          return false
        }
      })
      if (isExcluded) continue
    }

    return rule.group
  }
  return 'Other Files'
}

/**
 * Groups items by the chosen strategy. Within each group, files are sorted
 * according to `sortBy` so sorting is scoped to group boundaries.
 */
export function groupFiles<T>(
  items: T[],
  getPath: (item: T) => string,
  getChangeType: (item: T) => string,
  groupBy: FilesGroupBy,
  sortBy: FilesSortBy,
  customRules?: CustomGroupRule[]
): FileGroup<T>[] {
  if (groupBy === 'none') {
    return [{ label: '', files: sortFiles(items, getPath, getChangeType, sortBy) }]
  }

  const buckets = new Map<string, T[]>()

  for (const item of items) {
    let key: string
    switch (groupBy) {
      case 'extension':
        key = getExtension(getPath(item))
        break
      case 'changeType':
        key = getChangeType(item)
        break
      case 'directory':
        key = getDirectory(getPath(item))
        break
      case 'custom':
        key = matchCustomRule(getPath(item), customRules ?? [])
        break
    }

    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(item)
  }

  // Sort group keys deterministically
  let sortedKeys: string[]

  if (groupBy === 'custom' && customRules) {
    // Preserve user-defined rule order; "Other Files" always last
    const ruleOrder = customRules.map((r) => r.group)
    sortedKeys = [...buckets.keys()].sort((a, b) => {
      if (a === 'Other Files') return 1
      if (b === 'Other Files') return -1
      const idxA = ruleOrder.indexOf(a)
      const idxB = ruleOrder.indexOf(b)
      return (idxA === -1 ? Infinity : idxA) - (idxB === -1 ? Infinity : idxB)
    })
  } else {
    sortedKeys = [...buckets.keys()].sort((a, b) => {
      if (groupBy === 'changeType') {
        return getChangeTypeOrder(a) - getChangeTypeOrder(b)
      }
      return a.localeCompare(b)
    })
  }

  return sortedKeys.map((key) => {
    const label = groupBy === 'changeType' ? (CHANGE_TYPE_LABELS[key] ?? key) : key
    return {
      label,
      files: sortFiles(buckets.get(key)!, getPath, getChangeType, sortBy)
    }
  })
}
