export interface GenerationStatusData {
  isGenerating: boolean
  phase: string
  currentChapterIndex: number
  totalChapters: number
  streamingContent: string
  error: string | null
  hasPending: boolean
  chaptersExist: boolean
  bookId: string
  bookStartedAt: number | null
  chapterStartedAt: number | null
  generateAllChapters: (bookId: string, model?: string) => void
  stopGeneration: () => void
}
