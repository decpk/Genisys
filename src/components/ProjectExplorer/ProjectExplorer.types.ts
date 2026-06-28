export interface RepoItem {
  objectId: string
  gitObjectType: string
  commitId: string
  path: string
  isFolder: boolean
  url: string
  /** Local-only: file size in bytes */
  size?: number
  /** Local-only: last modified ISO string */
  modifiedAt?: string
  /** Local-only: unix permission mode (e.g. '755') */
  mode?: string
}

export interface NavEntry {
  path: string
  type: 'folder' | 'file'
  objectId?: string
}

export interface RepoInfo {
  organization: string
  project: string
  repository: string
  source: 'local'
  localPath?: string
}

export interface ExplorerPaneConfig {
  id: string
  repoInfo?: RepoInfo
}
