import { Bookmark, BookOpen, ArrowRight } from 'lucide-react'

import { useResumeReading } from './ResumeReading.hooks'

export function ResumeReading(): React.JSX.Element | null {
  const { resumeTarget, selectChapter } = useResumeReading()

  if (!resumeTarget) return null

  const icon =
    resumeTarget.type === 'bookmark' ? (
      <Bookmark size={14} className="text-primary/50 group-hover:text-primary/70 transition-colors shrink-0" />
    ) : (
      <BookOpen size={14} className="text-primary/50 group-hover:text-primary/70 transition-colors shrink-0" />
    )

  const label = resumeTarget.type === 'bookmark' ? 'Resume from bookmark' : 'Continue reading'
  const detail = resumeTarget.type === 'bookmark' ? resumeTarget.label : resumeTarget.chapterTitle

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button
        onClick={() => selectChapter(resumeTarget.chapterId)}
        style={{ animation: 'subtle-pulse 2s ease-in-out 0.5s 3' }}
        className="group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border border-primary/15 hover:bg-primary/[0.06] hover:border-primary/25 transition-colors duration-200 cursor-pointer"
      >
        {/* Glow ring */}
        <span
          style={{ animation: 'glow-ring 2s ease-in-out 0.5s 3' }}
          className="absolute inset-0 rounded-lg pointer-events-none"
        />
        {icon}
        <div className="text-left min-w-0">
          <span className="block text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium leading-none mb-1">
            {label}
          </span>
          <span className="block text-[13px] text-foreground/70 group-hover:text-foreground transition-colors truncate">
            Ch. {resumeTarget.chapterNumber} — {detail}
          </span>
        </div>
        <ArrowRight
          size={14}
          className="text-primary/0 group-hover:text-primary/50 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 shrink-0"
        />
      </button>
    </div>
  )
}
