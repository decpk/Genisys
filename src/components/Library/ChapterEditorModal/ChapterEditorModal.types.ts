import type { Chapter } from '@/store/library-store'

export interface ChapterEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapter: Chapter
  bookId: string
}
