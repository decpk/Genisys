import { ChevronRight, Copy } from 'lucide-react'

import { copyToClipboard } from '@/lib/clipboard'

interface ExplorerBreadcrumbProps {
  currentPath: string
  onNavigate: (path: string) => void
  repoName: string
}

export function ExplorerBreadcrumb({
  currentPath,
  onNavigate,
  repoName
}: ExplorerBreadcrumbProps): React.JSX.Element {
  const segments = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean)

  const handleCopyPath = (): void => {
    const fullPath = currentPath === '/' ? repoName : `${repoName}${currentPath}`
    copyToClipboard(fullPath)
  }

  return (
    <div className="flex items-center gap-0.5 ml-2 text-sm overflow-x-auto scrollbar-none">
      <button
        onClick={() => onNavigate('/')}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 px-1 py-0.5 rounded hover:bg-secondary"
      >
        {repoName}
      </button>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-0.5 shrink-0">
            <ChevronRight size={14} className="text-muted-foreground/50" />
            {isLast ? (
              <button
                onClick={handleCopyPath}
                className="text-foreground font-medium px-1 py-0.5 rounded hover:bg-secondary transition-colors cursor-pointer inline-flex items-center gap-2 group"
                title="Click to copy path"
              >
                {seg}
                <Copy
                  size={12}
                  className="text-muted-foreground/0 group-hover:text-muted-foreground transition-colors"
                />
              </button>
            ) : (
              <button
                onClick={() => onNavigate(path)}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary px-1 py-0.5 rounded transition-colors cursor-pointer"
              >
                {seg}
              </button>
            )}
          </span>
        )
      })}
    </div>
  )
}
