/**
 * Resolves a request name: summary → operationId → "<METHOD> <path>".
 */
export function resolveOperationName(
  summary: string | undefined,
  operationId: string | undefined,
  method: string,
  path: string
): string {
  if (typeof summary === 'string' && summary.length > 0) return summary
  if (typeof operationId === 'string' && operationId.length > 0) return operationId
  return `${method} ${path}`
}
