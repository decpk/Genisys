import type { BookLength } from '../../../book-prompt'
import type { ContentType } from '../../NewBookDialog.types'
import type { SourceType } from '../SourceTypePicker'

export interface BookLengthPickerProps {
  value: BookLength
  onChange: (value: BookLength) => void
  contentType: ContentType
  sourceType: SourceType
}
