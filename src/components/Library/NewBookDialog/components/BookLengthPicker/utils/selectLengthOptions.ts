import {
  ARTICLE_LENGTH_OPTIONS,
  BOOK_LENGTH_OPTIONS,
  WEBPAGE_LENGTH_OPTIONS,
} from '../../../NewBookDialog.constants'
import type { BookLengthOption, ContentType } from '../../../NewBookDialog.types'
import type { SourceType } from '../../SourceTypePicker'

export function selectLengthOptions(
  contentType: ContentType,
  sourceType: SourceType,
): BookLengthOption[] {
  if (contentType === 'article') return ARTICLE_LENGTH_OPTIONS
  if (sourceType === 'webpage') return WEBPAGE_LENGTH_OPTIONS
  return BOOK_LENGTH_OPTIONS
}
