import type { NormalizedImportCollection, NormalizedImportRequest } from '../collection-import.types'
import type {
  InsomniaExport,
  InsomniaRequest,
  InsomniaRequestGroup,
  InsomniaResource,
  InsomniaWorkspace,
} from './insomnia.types'
import { buildInsomniaFolderPath } from './buildInsomniaFolderPath'
import { mapInsomniaRequest } from './mapInsomniaRequest'
import { mapInsomniaVariables } from './mapInsomniaVariables'

/**
 * Parse a raw Insomnia v4 export (JSON string) into a normalized
 * import collection. Throws only when the input is not valid JSON or
 * is not an Insomnia export envelope.
 */
export function parseInsomniaExport(raw: string): NormalizedImportCollection {
  const data = parseJson(raw)

  if (!isInsomniaExport(data)) {
    throw new Error('Invalid Insomnia export: expected an export envelope with a resources array.')
  }

  const resources = data.resources
  const workspace = findWorkspace(resources)
  const groupsById = indexGroups(resources)

  const requests: NormalizedImportRequest[] = []
  for (const resource of resources) {
    if (resource._type !== 'request') continue
    const request = resource as InsomniaRequest
    const folderPath = buildInsomniaFolderPath(request.parentId, groupsById, workspace?._id)
    requests.push(mapInsomniaRequest(request, folderPath))
  }

  return {
    name: workspace?.name ?? 'Imported Collection',
    description: workspace?.description ?? '',
    requests,
    variables: mapInsomniaVariables(resources),
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Invalid Insomnia export: could not parse JSON.')
  }
}

function isInsomniaExport(data: unknown): data is InsomniaExport {
  if (typeof data !== 'object' || data === null) return false
  const candidate = data as Record<string, unknown>
  return candidate._type === 'export' && Array.isArray(candidate.resources)
}

function findWorkspace(resources: InsomniaResource[]): InsomniaWorkspace | undefined {
  const workspace = resources.find((resource) => resource._type === 'workspace')
  return workspace as InsomniaWorkspace | undefined
}

function indexGroups(resources: InsomniaResource[]): Map<string, InsomniaRequestGroup> {
  const groupsById = new Map<string, InsomniaRequestGroup>()
  for (const resource of resources) {
    if (resource._type !== 'request_group') continue
    const group = resource as InsomniaRequestGroup
    groupsById.set(group._id, group)
  }
  return groupsById
}
