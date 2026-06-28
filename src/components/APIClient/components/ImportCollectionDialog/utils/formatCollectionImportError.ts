/**
 * Normalizes an unknown thrown value into a user-facing error message.
 */
export function formatCollectionImportError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Something went wrong while importing the collection.'
}
