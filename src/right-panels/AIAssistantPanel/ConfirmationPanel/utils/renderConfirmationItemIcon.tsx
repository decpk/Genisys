import {
  FileCode,
  FileJson,
  FilePen,
  FileText,
  FolderPlus,
  GitBranch,
  GitCommit,
  Pencil,
  Trash2,
} from 'lucide-react'

interface RenderOptions {
  type: string
  path: string
  size?: number
  className?: string
}

/**
 * Render the contextual icon for a confirmation item directly as JSX.
 * Returning JSX (not a component reference) keeps lint's
 * `react-hooks/static-components` happy — the icon component is statically
 * resolved per branch.
 */
export function renderConfirmationItemIcon(opts: RenderOptions): React.JSX.Element {
  const { type, path, size = 11, className } = opts
  const t = typeof type === 'string' ? type.toLowerCase() : ''

  if (/delete|remove|rm/.test(t)) return <Trash2 size={size} className={className} />
  if (/commit/.test(t)) return <GitCommit size={size} className={className} />
  if (/branch|checkout/.test(t)) return <GitBranch size={size} className={className} />
  if (/create|new|add/.test(t)) return <FolderPlus size={size} className={className} />
  if (/edit|modify|update|patch|write/.test(t)) return <Pencil size={size} className={className} />
  if (/rename|move/.test(t)) return <FilePen size={size} className={className} />

  const p = typeof path === 'string' ? path.toLowerCase() : ''
  if (/\.json$/.test(p)) return <FileJson size={size} className={className} />
  if (/\.(ts|tsx|js|jsx|rs|go|py|rb|java|kt|swift)$/.test(p)) {
    return <FileCode size={size} className={className} />
  }
  return <FileText size={size} className={className} />
}
