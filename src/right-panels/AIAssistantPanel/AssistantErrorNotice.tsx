import { useState } from 'react'
import { AlertTriangle, ChevronRight, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { parseReviewerError } from '@/lib/parseReviewerError'

import { errorStyles } from './AIAssistantPanel.styles'

interface AssistantErrorNoticeProps {
  error: string
  canResend: boolean
  onResend: () => void
}

/**
 * Polished error notice for the AI assistant. Parses the raw error (HTML or
 * plain text) into a clean title + message and tucks the raw payload behind a
 * collapsible "Details" disclosure.
 */
export function AssistantErrorNotice({
  error,
  canResend,
  onResend,
}: AssistantErrorNoticeProps): React.JSX.Element {
  const [showDetails, setShowDetails] = useState(false)
  const { title, message, details } = parseReviewerError(error)

  return (
    <div className={errorStyles.root}>
      <div className={errorStyles.header}>
        <AlertTriangle size={12} />
        {title}
      </div>
      <p className={errorStyles.message}>{message}</p>

      {details && (
        <div>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
            className={errorStyles.detailsToggle}
          >
            <ChevronRight
              className={cn('size-3 transition-transform', showDetails && 'rotate-90')}
            />
            {showDetails ? 'Hide details' : 'Details'}
          </button>
          {showDetails && <pre className={errorStyles.details}>{details}</pre>}
        </div>
      )}

      {canResend && (
        <div>
          <Button
            variant="ghost"
            size="xs"
            className={errorStyles.resendButton}
            onClick={onResend}
          >
            <RotateCcw size={10} />
            Resend
          </Button>
        </div>
      )}
    </div>
  )
}
