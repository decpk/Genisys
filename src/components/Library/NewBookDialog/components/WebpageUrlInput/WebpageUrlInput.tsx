import { Globe } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { WebpageUrlInputProps } from './WebpageUrlInput.types'
import * as styles from './WebpageUrlInput.styles'

const HINT_TEXT = "We'll fetch the page and let the AI structure chapters in the same order as the page."

export function WebpageUrlInput(props: WebpageUrlInputProps): React.JSX.Element {
  const { value, onChange, onSubmit, error, isLoading, autoFocus } = props

  const hasError = Boolean(error && error.length > 0)
  let messageNode: React.JSX.Element
  if (hasError) {
    messageNode = <p className={styles.ERROR}>{error}</p>
  } else {
    messageNode = <p className={styles.HINT}>{HINT_TEXT}</p>
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      onSubmit?.()
    }
  }

  return (
    <div className={styles.WRAPPER}>
      <label className={styles.LABEL}>Webpage URL</label>
      <div className={styles.INPUT_WRAPPER}>
        <span className={styles.ICON_WRAPPER}>
          <Globe size={14} />
        </span>
        <Input
          type="url"
          placeholder="https://example.com/article-or-docs-page"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          autoFocus={autoFocus}
          onKeyDown={handleKeyDown}
          className={cn(styles.INPUT)}
        />
      </div>
      {messageNode}
    </div>
  )
}
