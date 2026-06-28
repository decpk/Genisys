import type { ContentType } from '../../../NewBookDialog.types'
import type { SourceType } from '../../SourceTypePicker'

export function selectLengthLabel(contentType: ContentType, sourceType: SourceType): string {
  if (contentType === 'article') return 'Article Length'
  if (sourceType === 'webpage') return 'Webpage Mapping'
  return 'Book Length'
}
