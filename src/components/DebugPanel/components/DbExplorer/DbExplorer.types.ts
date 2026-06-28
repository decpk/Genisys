export interface QueryResult {
  success: boolean
  columns?: string[]
  rows?: unknown[][]
  count?: number
  changes?: number
  error?: string
}

export interface SavedQuery {
  id: string
  label: string
  description: string
  query: string
  isWrite: boolean
  category: 'read' | 'write' | 'delete' | 'schema'
}
