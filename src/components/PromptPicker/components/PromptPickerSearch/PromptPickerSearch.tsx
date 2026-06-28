import { Search, X } from 'lucide-react'

import { promptPickerStyles } from '../../PromptPicker.styles'

export interface PromptPickerSearchProps {
  query: string
  onQueryChange: (q: string) => void
  autoFocus?: boolean
}

export function PromptPickerSearch(props: PromptPickerSearchProps): React.JSX.Element {
  const { query, onQueryChange, autoFocus = true } = props
  const hasQuery = query.length > 0
  return (
    <div className={promptPickerStyles.searchWrap}>
      <Search size={12} className="shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={query}
        autoFocus={autoFocus}
        placeholder="Search prompts…"
        className={promptPickerStyles.searchInput}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {hasQuery && (
        <button
          type="button"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          onClick={() => onQueryChange('')}
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
