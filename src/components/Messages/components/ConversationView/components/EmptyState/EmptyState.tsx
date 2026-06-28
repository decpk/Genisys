import { Lock, MessagesSquare, ShieldCheck } from 'lucide-react'

import { emptyStateStyles as s } from './EmptyState.styles'

export function EmptyState(): React.JSX.Element {
  return (
    <div className={s.root}>
      <div className={s.glyphWrap}>
        <div className={s.glyphRing}>
          <MessagesSquare className={s.glyphIcon} />
        </div>
        <span className={s.lockBadge}>
          <Lock className="h-4 w-4" />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className={s.title}>Select or connect to a peer</h2>
        <p className={s.subtitle}>
          Pick a conversation from the sidebar, or connect to someone on your
          local network to start a private, encrypted chat.
        </p>
      </div>
      <span className={s.privacy}>
        <ShieldCheck className={s.privacyIcon} />
        End-to-end encrypted · nothing leaves your device
      </span>
    </div>
  )
}
