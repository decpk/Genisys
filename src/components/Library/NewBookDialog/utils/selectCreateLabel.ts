import type { BookMode, ContentType } from '../NewBookDialog.types'
import type { SourceType } from '../components/SourceTypePicker'

export function selectCreateLabel(
  mode: BookMode,
  contentType: ContentType,
  sourceType: SourceType,
): string {
  if (mode === 'raw-md') return 'Import Book'
  if (mode === 'local-md') return 'Import from Files'
  if (sourceType === 'webpage') return 'Fetch & Generate'
  if (contentType === 'article') return 'Create Article'
  return 'Create Book'
}
