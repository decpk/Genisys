import { getFileIcon } from '@/lib/file-icons'
import { CATEGORY_STYLES } from '../../GitPanel.constants'
import type { GitFileItemProps } from './GitFileItem.types'

export function GitFileItem({ file, category }: GitFileItemProps): React.JSX.Element {
  const fileName = file.path.split('/').pop() ?? file.path
  const dirPath = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : ''
  const style = CATEGORY_STYLES[category]

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary transition-colors group text-xs min-w-0">
      <span className="shrink-0 self-start mt-0.5">{getFileIcon(fileName, false, 14)}</span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="truncate text-foreground leading-tight">{fileName}</span>
        {dirPath && (
          <span className="truncate text-muted-foreground/60 text-[10px] leading-tight">
            {dirPath}
          </span>
        )}
      </div>
      <span
        className={`shrink-0 self-start mt-0.5 inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium border ${style.badgeClass}`}
      >
        {style.label.charAt(0)}
      </span>
    </div>
  )
}
