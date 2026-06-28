import { BookOpen } from 'lucide-react'

import { ProgressBanner } from '../ProgressBanner'
import { BookTitlePage } from '../BookTitlePage'
import { GenerationStatus } from '../GenerationStatus'
import { BookTableOfContents } from '../BookTableOfContents'
import { ResumeGenerationDialog } from '../ResumeGenerationDialog'

import { useBookOverview } from './BookOverview.hooks'

export function BookOverview(): React.JSX.Element {
  const { hasActiveBook } = useBookOverview()

  if (!hasActiveBook) return <div />

  return (
    <div className="h-full">
      <ProgressBanner />
      <div className="w-full px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <BookTitlePage />
        <GenerationStatus />
        <BookTableOfContents />

        {/* Colophon */}
        <div className="pt-6 border-t border-border/20">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-border/30" />
            <BookOpen size={12} className="text-muted-foreground/20" />
            <div className="h-px w-6 bg-border/30" />
          </div>
        </div>
      </div>
      <ResumeGenerationDialog />
    </div>
  )
}
