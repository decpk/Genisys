import { Info, Lock, ShieldCheck } from 'lucide-react'

import { Identicon } from '@/components/Messages/components/Identicon'
import { cn } from '@/lib/utils'

import { CallButtons } from "./components/CallButtons";
import { MessagesWidthPicker } from './components/MessagesWidthPicker'
import { conversationHeaderStyles as s } from './ConversationHeader.styles'
import type { ConversationHeaderProps } from './ConversationHeader.types'
import { useConversationHeaderData } from './useConversationHeaderData'

export function ConversationHeader(props: ConversationHeaderProps): React.JSX.Element {
  const { peer } = props
  const { rightPanelOpen, toggleInfo, contentWidth, setContentWidth } = useConversationHeaderData()

  let verifiedBadge: React.JSX.Element | null = null
  if (peer.verified) {
    verifiedBadge = (
      <span className={s.verified}>
        <ShieldCheck className={s.verifiedIcon} />
        Verified
      </span>
    )
  }

  return (
    <div className={s.root}>
      <Identicon seed={peer.publicKey || peer.id} size={30} />
      <div className={s.info}>
        <div className={s.nameRow}>
          <span className={s.name}>{peer.displayName}</span>
          {verifiedBadge}
        </div>
        <span className={s.lockPill}>
          <Lock className={s.lockIcon} />
          End-to-end encrypted
        </span>
      </div>
      <CallButtons peer={peer} />
      <button
        type="button"
        className={cn(s.infoButton, rightPanelOpen && s.infoButtonActive)}
        onClick={toggleInfo}
        aria-label="Toggle peer details"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <MessagesWidthPicker
        contentWidth={contentWidth}
        onContentWidthChange={setContentWidth}
      />
    </div>
  );
}
