import { extractTitleFromMarkdown } from '@/components/Library/NewBookDialog/NewBookDialog.constants'
import { parseMarkdownToChapters } from '@/components/Library/md-book-parser'
import { useLibraryStore } from '@/store/library-store'
import { useNavigationStore } from '@/store/navigation-store'
import { notify } from '@/frameworks/notification'

export async function addFileToLibrary(filePath: string, rootPath?: string): Promise<void> {
  const result = (await window.api.getLocalFileContent({
    rootPath: rootPath ?? '/',
    filePath
  })) as { success: boolean; data?: string; error?: string }

  if (!result.success || !result.data) {
    notify({ type: 'error', source: 'explorer', message: 'Failed to read file' })
    return
  }

  const content = result.data
  const chapters = parseMarkdownToChapters(content)
  if (chapters.length === 0) {
    notify({ type: 'error', source: 'explorer', message: 'No content found in file' })
    return
  }

  const fileName = filePath.split('/').pop()?.replace(/\.(md|mdx|markdown)$/i, '') ?? 'Untitled'
  const title = extractTitleFromMarkdown(content)
  const bookTitle = title !== 'Untitled Book' ? title : fileName

  const { createBook, addChapter, updateBookStatus } = useLibraryStore.getState()
  const book = await createBook(bookTitle)

  for (const ch of chapters) {
    await addChapter({
      bookId: book.id,
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      content: ch.content,
      status: 'completed',
      sortOrder: ch.chapterNumber,
      isRead: false
    })
  }

  await updateBookStatus(book.id, 'completed')
  notify({
    type: 'success',
    source: 'explorer',
    message: `${bookTitle} added to Library`,
    actions: [
      {
        label: 'Revert',
        onClick: async () => {
          try {
            await useLibraryStore.getState().removeBook(book.id)
          } catch {
            notify({
              type: 'error',
              source: 'explorer',
              message: `Failed to revert ${bookTitle}`
            })
          }
        }
      },
      {
        label: 'Open in Library',
        onClick: () => useNavigationStore.getState().openLibraryBook(book.id)
      }
    ]
  })
}
