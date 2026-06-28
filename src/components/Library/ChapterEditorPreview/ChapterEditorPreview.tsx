import { useMemo, forwardRef } from 'react'

import { createMarkdownComponents } from '../chapter-markdown-components'
import { splitContentIntoSegments } from '../quiz-parser'
import { QuizSection } from '../QuizSection'
import { ChallengeSection } from '../ChallengeSection'
import { LibraryMarkdown } from '../LibraryMarkdown'
import { useChapterEditorPreview } from './ChapterEditorPreview.hooks'

interface ChapterEditorPreviewProps {
  content: string
}

export const ChapterEditorPreview = forwardRef<HTMLDivElement, ChapterEditorPreviewProps>(
  function ChapterEditorPreview({ content }, ref) {
    const { debouncedContent } = useChapterEditorPreview(content)

    const segments = useMemo(
      () => (debouncedContent ? splitContentIntoSegments(debouncedContent) : []),
      [debouncedContent],
    )

    const mdComponents = useMemo(() => {
      const counters = {
        code: 0,
        blockquote: 0,
        paragraph: 0,
        sectionSlugs: new Map<string, number>(),
      }
      return createMarkdownComponents(counters, false)
    }, [debouncedContent])

    return (
      <div ref={ref} className="h-full overflow-y-auto scroll-smooth">
        <article className="max-w-none mx-auto px-6 py-6">
          {debouncedContent ? (
            <div className="max-w-none">
              {segments.map((seg, i) =>
                seg.type === 'markdown' ? (
                  <LibraryMarkdown
                    key={i}
                    content={seg.content}
                    components={mdComponents}
                  />
                ) : seg.type === 'quiz' ? (
                  <QuizSection key={i} title={seg.title} questions={seg.questions} />
                ) : seg.type === 'challenge' ? (
                  <ChallengeSection key={i} challenges={seg.challenges} />
                ) : null,
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground/50">
              Start typing to see the preview…
            </div>
          )}
        </article>
      </div>
    )
  },
)
