import { AlertTriangle, Lock, ShieldCheck, Trash2 } from 'lucide-react'

import { Identicon } from '@/components/Messages/components/Identicon'
import { PresenceDot } from '@/components/Messages/components/PresenceDot'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'

import { peerListItemStyles as s } from './PeerListItem.styles'
import type { PeerListItemProps } from './PeerListItem.types'
import { usePeerListItemData } from './usePeerListItemData'

export function PeerListItem(props: PeerListItemProps): React.JSX.Element {
  const { peer, variant } = props
  const {
    isActive,
    isConnecting,
    handleSelect,
    handleConnect,
    handleDeleteConversation,
    preview,
    timeLabel,
    unreadCount,
  } = usePeerListItemData(peer)

  const isConversation = variant === 'conversation'

  const badges: React.JSX.Element[] = []
  if (isConversation) {
    badges.push(<Lock key="lock" className={cn('h-3 w-3', s.lockBadge)} />)
    if (peer.verified) {
      badges.push(
        <ShieldCheck key="verified" className={cn('h-3.5 w-3.5', s.verifiedBadge)} />
      )
    }
    if (peer.keyChanged) {
      badges.push(
        <AlertTriangle key="warn" className={cn('h-3.5 w-3.5', s.warnBadge)} />
      )
    }
  }

  let handleClick = handleSelect
  if (!isConversation) handleClick = handleConnect

  const hostPort = `${peer.host}:${peer.port}`
  let metaText = hostPort
  if (isConversation && preview !== null) metaText = preview

  let timeNode: React.JSX.Element | null = null
  if (isConversation && timeLabel !== null) {
    timeNode = <span className={s.time}>{timeLabel}</span>
  }

  let unreadNode: React.JSX.Element | null = null
  if (isConversation && unreadCount > 0) {
    unreadNode = <span className={s.unreadBadge}>{unreadCount}</span>
  }

  let endNode: React.JSX.Element | null = null
  if (timeNode || unreadNode) {
    endNode = (
      <span className={s.endCol}>
        {timeNode}
        {unreadNode}
      </span>
    )
  }

  let connectChip: React.JSX.Element | null = null
  if (!isConversation) {
    const label = isConnecting ? 'Connecting…' : 'Connect'
    connectChip = (
      <span className={s.connectButton} aria-hidden>
        {label}
      </span>
    )
  }

  const row = (
    <button
      type="button"
      className={cn(s.row, isConversation && isActive && s.rowActive)}
      onClick={handleClick}
      disabled={isConnecting}
    >
      <span className={s.avatarWrap}>
        <Identicon seed={peer.publicKey || peer.id} size={34} />
        <PresenceDot status={peer.status} size={10} className={s.presence} />
      </span>
      <span className={s.body}>
        <span className={s.nameRow}>
          <span className={s.name}>{peer.displayName}</span>
          <span className={s.badges}>{badges}</span>
        </span>
        <span className={s.metaRow}>{metaText}</span>
      </span>
      {endNode}
      {connectChip}
    </button>
  )

  if (!isConversation) return row

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={handleDeleteConversation}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 size={15} />
          Delete conversation
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
