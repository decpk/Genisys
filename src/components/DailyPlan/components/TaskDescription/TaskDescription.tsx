import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { cn } from '@/lib/utils'
import { isBlankDescription } from './utils/isBlankDescription'
import { buildClampStyle } from './utils/buildClampStyle'
import { taskDescriptionStyles as s } from './TaskDescription.styles'
import type { TaskDescriptionProps } from './TaskDescription.types'

export function TaskDescription(props: TaskDescriptionProps): React.JSX.Element | null {
  const { content, clampLines, className } = props

  if (isBlankDescription(content)) return null

  const clampStyle = buildClampStyle(clampLines)
  const wrapperClass = cn(s.wrapper, className)

  return (
    <div className={wrapperClass} style={clampStyle}>
      <MarkdownRenderer content={content} variant="compact" className={s.markdown} />
    </div>
  )
}
