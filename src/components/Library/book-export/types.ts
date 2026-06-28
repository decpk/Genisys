// ─── Export Types ────────────────────────────────────────────────

export interface ExportChapter {
  chapterNumber: number
  title: string
  content: string // markdown
}

export interface ExportOptions {
  bookTitle: string
  bookDescription?: string
  chapters: ExportChapter[]
}

export interface ExportFormat {
  id: string
  label: string
  description?: string
  extension: string
  mimeType: string
  export(options: ExportOptions): Promise<Blob>
}
