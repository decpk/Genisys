export interface ResumeTarget {
  type: 'bookmark' | 'chapter'
  chapterId: string
  label: string
  chapterTitle: string
  chapterNumber: number
}
