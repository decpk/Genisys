// ─── Subset of the Postman Collection v2.1 schema we consume ─────

export interface PostmanInfo {
  name?: string
  description?: string | { content?: string }
  schema?: string
}

export interface PostmanQueryParam {
  key?: string
  value?: string
  disabled?: boolean
}

export interface PostmanUrl {
  raw?: string
  protocol?: string
  host?: string | string[]
  path?: string | string[]
  query?: PostmanQueryParam[]
}

export interface PostmanHeader {
  key?: string
  value?: string
  disabled?: boolean
}

export interface PostmanRawBodyOptions {
  language?: string
}

export interface PostmanBodyOptions {
  raw?: PostmanRawBodyOptions
}

export interface PostmanUrlEncodedParam {
  key?: string
  value?: string
  disabled?: boolean
}

export interface PostmanFormDataParam {
  key?: string
  value?: string
  type?: string
  disabled?: boolean
}

export interface PostmanGraphQlBody {
  query?: string
  variables?: string
}

export interface PostmanBody {
  mode?: string
  raw?: string
  urlencoded?: PostmanUrlEncodedParam[]
  formdata?: PostmanFormDataParam[]
  graphql?: PostmanGraphQlBody
  options?: PostmanBodyOptions
}

export interface PostmanAuthAttribute {
  key?: string
  value?: unknown
  type?: string
}

export interface PostmanAuth {
  type?: string
  bearer?: PostmanAuthAttribute[]
  basic?: PostmanAuthAttribute[]
  apikey?: PostmanAuthAttribute[]
}

export interface PostmanRequest {
  method?: string
  url?: string | PostmanUrl
  header?: PostmanHeader[]
  body?: PostmanBody
  auth?: PostmanAuth
  description?: string | { content?: string }
}

export interface PostmanItem {
  name?: string
  request?: string | PostmanRequest
  item?: PostmanItem[]
}

export interface PostmanItemGroup {
  name?: string
  item?: PostmanItem[]
}

export interface PostmanVariable {
  key?: string
  value?: string
  disabled?: boolean
}

export interface PostmanCollection {
  info?: PostmanInfo
  item?: PostmanItem[]
  variable?: PostmanVariable[]
  auth?: PostmanAuth
}
