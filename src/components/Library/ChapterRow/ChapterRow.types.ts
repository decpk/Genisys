import type { Chapter } from '@/store/library-store'

export interface ChapterRowProps {
  chapter: Chapter
  onClick: () => void
  onRetry?: () => void
}
