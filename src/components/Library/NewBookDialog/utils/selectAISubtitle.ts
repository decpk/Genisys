import type { ContentType } from '../NewBookDialog.types'
import type { SourceType } from '../components/SourceTypePicker'

export function selectAISubtitle(contentType: ContentType, sourceType: SourceType): string {
  if (sourceType === 'webpage') {
    return 'Paste a webpage URL — chapters will follow its sections in order.'
  }
  if (contentType === 'article') {
    return 'Enter a topic and an article will be generated automatically.'
  }
  return 'Enter a book title and chapters will be generated automatically.'
}
