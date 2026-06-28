import { getExtension } from './getExtension'
import { getBaseName } from './getBaseName'
import { getParentPath } from './getParentPath'

export function addCopySuffix(repoRelativePath: string, isFolder: boolean): string {
  const parent = getParentPath(repoRelativePath)
  const base = getBaseName(repoRelativePath)

  if (isFolder) {
    const existing = base.match(/^(.+?) copy(?: (\d+))?$/)
    if (existing) {
      const num = existing[2] ? parseInt(existing[2], 10) + 1 : 2
      return `${parent}/${existing[1]} copy ${num}`
    }
    return `${parent}/${base} copy`
  }

  const ext = getExtension(repoRelativePath)
  const nameWithoutExt = ext ? base.slice(0, -ext.length) : base
  const existing = nameWithoutExt.match(/^(.+?) copy(?: (\d+))?$/)
  if (existing) {
    const num = existing[2] ? parseInt(existing[2], 10) + 1 : 2
    return `${parent}/${existing[1]} copy ${num}${ext}`
  }
  return `${parent}/${nameWithoutExt} copy${ext}`
}
