import { GraduationCap } from 'lucide-react'

import { AppLoader } from '@/components/AppLoader'
import { MainEmptyState } from '@/components/ui/main-empty-state'
import { useWebpageStore } from '@/store/webpage-store'

import { ChapterViewer } from '../ChapterViewer'
import { ResumeGenerationDialog } from '../ResumeGenerationDialog'
import { BookOverview } from '../BookOverview'
import { WebpageViewer } from '../WebpageViewer'

import { useLibraryContent } from './LibraryContent.hooks'

export function LibraryContent(): React.JSX.Element {
  const { isLoading, isTransitioning, activeBook, activeChapter, bookTitle } = useLibraryContent()
  const activeWebpageId = useWebpageStore((s) => s.activeWebpageId)

  // Saved webpage takes priority when selected
  if (activeWebpageId) {
    return (
      <div className="flex-1 h-full overflow-hidden">
        <WebpageViewer webpageId={activeWebpageId} />
      </div>
    )
  }

  if (isLoading || isTransitioning) {
    return (
      <div className="flex-1 h-full">
        <AppLoader />
      </div>
    )
  }

  if (!activeBook) {
    return (
      <div className="flex-1 h-full">
        <MainEmptyState
          icon={GraduationCap}
          title="Library"
          description="Select a book from the sidebar or create a new one to start learning."
          hint="Click + to create a new book or import a webpage"
        />
      </div>
    )
  }

  if (activeChapter) {
    return (
      <div className="flex-1 h-full overflow-hidden">
        <ChapterViewer chapter={activeChapter} bookTitle={bookTitle} />
        <ResumeGenerationDialog />
      </div>
    )
  }

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <BookOverview />
    </div>
  )
}
