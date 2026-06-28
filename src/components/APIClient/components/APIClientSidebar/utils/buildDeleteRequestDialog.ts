export interface DeleteRequestDialogConfig {
  title: string
  description: string
}

/**
 * Build the confirmation dialog copy for deleting a single API request.
 * Pure function — no React/store dependencies — so it can be unit-tested in isolation.
 */
export function buildDeleteRequestDialog(requestName?: string): DeleteRequestDialogConfig {
  const trimmed = requestName?.trim()
  const label = trimmed ? `"${trimmed}"` : 'this request'
  return {
    title: 'Delete request',
    description: `Are you sure you want to delete ${label}? This action cannot be undone.`,
  }
}
