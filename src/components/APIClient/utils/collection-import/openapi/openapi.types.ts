// ─── Minimal OpenAPI 3.x / Swagger 2.0 subset we read for import ──
//
// These interfaces intentionally cover only the fields the parser
// consumes. Everything is optional so a partial/loose spec never
// crashes the mapper.

import type { HttpMethod } from '../../../APIClient.types'

export interface OpenApiInfo {
  title?: string
  description?: string
  version?: string
}

export interface OpenApiServer {
  url?: string
  description?: string
}

export interface OpenApiSchema {
  type?: string
  format?: string
  example?: unknown
  default?: unknown
  enum?: unknown[]
  items?: OpenApiSchema
  properties?: Record<string, OpenApiSchema>
  required?: string[]
  $ref?: string
}

export interface OpenApiMediaType {
  schema?: OpenApiSchema
  example?: unknown
}

export interface OpenApiRequestBody {
  description?: string
  required?: boolean
  content?: Record<string, OpenApiMediaType>
}

export interface OpenApiParameter {
  name?: string
  in?: 'query' | 'header' | 'path' | 'cookie'
  required?: boolean
  description?: string
  schema?: OpenApiSchema
  example?: unknown
  // Swagger 2.0 inlines these on the parameter object
  type?: string
  default?: unknown
  $ref?: string
}

export interface OpenApiOperation {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: OpenApiParameter[]
  requestBody?: OpenApiRequestBody
  security?: Array<Record<string, string[]>>
  // Swagger 2.0 body/consumes
  consumes?: string[]
}

export interface OpenApiPathItem {
  parameters?: OpenApiParameter[]
  get?: OpenApiOperation
  post?: OpenApiOperation
  put?: OpenApiOperation
  patch?: OpenApiOperation
  delete?: OpenApiOperation
  head?: OpenApiOperation
  options?: OpenApiOperation
}

export interface OpenApiSecurityScheme {
  type?: 'http' | 'apiKey' | 'oauth2' | 'openIdConnect' | string
  scheme?: string
  bearerFormat?: string
  name?: string
  in?: 'header' | 'query' | 'cookie'
}

export interface OpenApiComponents {
  securitySchemes?: Record<string, OpenApiSecurityScheme>
}

export interface OpenApiDocument {
  openapi?: string
  swagger?: string
  info?: OpenApiInfo
  servers?: OpenApiServer[]
  paths?: Record<string, OpenApiPathItem>
  components?: OpenApiComponents
  security?: Array<Record<string, string[]>>
  // Swagger 2.0 base-url fields
  schemes?: string[]
  host?: string
  basePath?: string
  // Swagger 2.0 security definitions
  securityDefinitions?: Record<string, OpenApiSecurityScheme>
}

// ─── Argument bag for the operation → request mapper ─────────────

export interface MapOpenApiOperationArgs {
  path: string
  method: HttpMethod
  operation: OpenApiOperation
  pathLevelParams: OpenApiParameter[]
  doc: OpenApiDocument
}
