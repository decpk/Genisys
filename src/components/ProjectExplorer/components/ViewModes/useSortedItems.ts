import { useMemo } from 'react'

import type { RepoItem } from '../../ProjectExplorer.types'
import type { SortConfig } from './ViewModes.types'

function getName(item: RepoItem): string {
  return item.path.split('/').pop()?.toLowerCase() ?? ''
}

function getExtension(item: RepoItem): string {
  const name = getName(item)
  const dot = name.lastIndexOf('.')
  return dot !== -1 ? name.slice(dot) : ''
}

export function useSortedItems(
  items: RepoItem[],
  sort: SortConfig,
  mixFoldersWithFiles: boolean = false
): RepoItem[] {
  return useMemo(() => {
    const dir = sort.direction === 'asc' ? 1 : -1

    const compare = (a: RepoItem, b: RepoItem): number => {
      switch (sort.field) {
        case 'name':
          return getName(a).localeCompare(getName(b)) * dir
        case 'extension':
          return (
            (getExtension(a).localeCompare(getExtension(b)) ||
              getName(a).localeCompare(getName(b))) * dir
          )
        case 'type':
          return (
            (a.gitObjectType.localeCompare(b.gitObjectType) ||
              getName(a).localeCompare(getName(b))) * dir
          )
        case 'path':
          return a.path.localeCompare(b.path) * dir
        case 'size':
          return ((a.size ?? 0) - (b.size ?? 0) || getName(a).localeCompare(getName(b))) * dir
        case 'modified': {
          const ta = a.modifiedAt ? new Date(a.modifiedAt).getTime() : 0
          const tb = b.modifiedAt ? new Date(b.modifiedAt).getTime() : 0
          return (ta - tb || getName(a).localeCompare(getName(b))) * dir
        }
        default:
          return getName(a).localeCompare(getName(b)) * dir
      }
    }

    if (mixFoldersWithFiles) {
      return [...items].sort(compare)
    }

    const folders = items.filter((i) => i.isFolder)
    const files = items.filter((i) => !i.isFolder)
    return [...folders.sort(compare), ...files.sort(compare)]
  }, [items, sort, mixFoldersWithFiles])
}
