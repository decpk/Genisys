import type { InsomniaRequestGroup } from './insomnia.types'

/**
 * Walk the parentId chain from a request/group up to the workspace,
 * collecting request_group names in root→leaf order. The workspace
 * itself is excluded from the resulting path.
 */
export function buildInsomniaFolderPath(
  parentId: string | null | undefined,
  groupsById: Map<string, InsomniaRequestGroup>,
  workspaceId: string | undefined
): string[] {
  const path: string[] = []
  const visited = new Set<string>()
  let currentId = parentId ?? null

  while (currentId && currentId !== workspaceId && !visited.has(currentId)) {
    visited.add(currentId)
    const group = groupsById.get(currentId)
    if (!group) break
    path.unshift(group.name ?? '')
    currentId = group.parentId ?? null
  }

  return path
}
