import type { ContentType } from '../../NewBookDialog.types'

export interface ContentTypePickerProps {
  value: ContentType
  onChange: (value: ContentType) => void
}
