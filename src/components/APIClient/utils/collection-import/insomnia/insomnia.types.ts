// ─── Insomnia v4 export subset ───────────────────────────────────
// Minimal structural types for the resources we read while importing.

export interface InsomniaHeader {
  name?: string
  value?: string
  disabled?: boolean
}

export interface InsomniaParameter {
  name?: string
  value?: string
  disabled?: boolean
}

export interface InsomniaBodyParam {
  name?: string
  value?: string
  disabled?: boolean
}

export interface InsomniaBody {
  mimeType?: string
  text?: string
  params?: InsomniaBodyParam[]
}

export interface InsomniaAuth {
  type?: string
  token?: string
  username?: string
  password?: string
  key?: string
  value?: string
  addTo?: string
  disabled?: boolean
}

export interface InsomniaWorkspace {
  _id: string
  _type: 'workspace'
  name?: string
  description?: string
  parentId?: string | null
}

export interface InsomniaRequestGroup {
  _id: string
  _type: 'request_group'
  name?: string
  parentId?: string | null
}

export interface InsomniaRequest {
  _id: string
  _type: 'request'
  name?: string
  method?: string
  url?: string
  parentId?: string | null
  headers?: InsomniaHeader[]
  parameters?: InsomniaParameter[]
  body?: InsomniaBody
  authentication?: InsomniaAuth
}

export interface InsomniaEnvironment {
  _id: string
  _type: 'environment'
  name?: string
  parentId?: string | null
  data?: Record<string, unknown>
}

export type InsomniaResource =
  | InsomniaWorkspace
  | InsomniaRequestGroup
  | InsomniaRequest
  | InsomniaEnvironment
  | { _id: string; _type: string; parentId?: string | null }

export interface InsomniaExport {
  _type: 'export'
  __export_format: number
  resources: InsomniaResource[]
}
