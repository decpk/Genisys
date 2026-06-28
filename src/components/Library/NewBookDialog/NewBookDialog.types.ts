import type { BookLength } from '../book-prompt'

export type BookMode = 'ai' | 'raw-md' | 'local-md'

export type ContentType = 'book' | 'article'

export interface NewBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface BookLengthOption {
  value: BookLength
  label: string
  description: string
}

export interface ContentTypeOption {
  value: ContentType
  label: string
  description: string
}
