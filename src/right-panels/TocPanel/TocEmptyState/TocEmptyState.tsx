import { Sparkles } from 'lucide-react'

import { emptyStateStyles } from '../TocPanel.styles'

export function TocEmptyState(): React.JSX.Element {
  return (
    <div className={emptyStateStyles}>
      <Sparkles size={20} className="mb-2" />
      <span className="text-xs text-center">No highlights yet</span>
    </div>
  )
}
