import { Copy, Eye, EyeOff, Pencil, Radar, RefreshCw } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { Identicon } from '@/components/Messages/components/Identicon'
import { PresenceDot } from "@/components/Messages/components/PresenceDot";
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'

import { identityCardStyles as s } from './IdentityCard.styles'
import { useIdentityCardData } from './useIdentityCardData'

export function IdentityCard(): React.JSX.Element | null {
  const {
    identity,
    isEditing,
    draftName,
    nameRevealed,
    idRevealed,
    addressRevealed,
    isOffline,
    offlineBusy,
    nameText,
    idText,
    addressText,
    addressListening,
    startEdit,
    cancelEdit,
    setDraftName,
    commitName,
    toggleNameReveal,
    toggleIdReveal,
    toggleAddressReveal,
    copyAddress,
    rescan,
    rescanBusy,
    rotate,
    toggleOffline,
  } = useIdentityCardData()

  if (!identity) return null

  const presenceStatus = isOffline ? 'offline' : 'connected'

  let nameNode: React.JSX.Element
  if (isEditing) {
    nameNode = (
      <input
        className={s.nameInput}
        value={draftName}
        autoFocus
        maxLength={40}
        onChange={(e) => setDraftName(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitName()
          if (e.key === 'Escape') {
            e.preventDefault()
            cancelEdit()
          }
        }}
      />
    )
  } else {
    nameNode = (
      <div className={s.nameRow}>
        <span className={s.name}>{nameText}</span>
        <span className={s.youBadge}>You</span>
        <button
          type="button"
          className={s.editButton}
          onClick={startEdit}
          aria-label="Edit display name"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={s.revealToggle}
          onClick={toggleNameReveal}
          aria-label={nameRevealed ? 'Hide name' : 'Show name'}
        >
          {nameRevealed ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    )
  }

  let addressNode: React.JSX.Element
  if (addressText) {
    addressNode = <span className={s.address}>{addressText}</span>
  } else {
    addressNode = (
      <span className={s.addressEmpty}>Network address unavailable</span>
    )
  }

  return (
    <div className={s.root}>
      <div className={s.topRow}>
        <div className={s.avatarWrap}>
          <Identicon seed={identity.fingerprint} size={44} />
          <PresenceDot
            status={presenceStatus}
            size={12}
            className={s.presence}
          />
        </div>
        <div className={s.body}>
          {nameNode}
          <div className={s.metaRow}>
            <span className={s.fingerprint}>{idText}</span>
            <button
              type="button"
              className={cn(s.revealToggle, 'ml-auto')}
              onClick={toggleIdReveal}
              aria-label={idRevealed ? "Hide ID" : "Show ID"}
            >
              {idRevealed ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={s.addressRow}>
        <div className={s.addressInfo}>
          <div className={s.addressLabel}>Your address</div>
          {addressNode}
          {addressText && !addressListening && (
            <span className={s.addressNote}>
              Go online to let peers connect
            </span>
          )}
        </div>
        <Tooltip content="Copy your address">
          <button
            type="button"
            className={s.iconButton}
            onClick={copyAddress}
            disabled={!addressText}
            aria-label="Copy your address"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
        <Tooltip content="Rescan network">
          <button
            type="button"
            className={s.iconButton}
            onClick={rescan}
            disabled={rescanBusy || isOffline}
            aria-label="Rescan network"
          >
            <Radar className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
        <Tooltip content="Rotate your address">
          <button
            type="button"
            className={s.iconButton}
            onClick={rotate}
            aria-label="Rotate your address"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
        <button
          type="button"
          className={s.revealToggle}
          onClick={toggleAddressReveal}
          disabled={!addressText}
          aria-label={addressRevealed ? "Hide address" : "Show address"}
        >
          {addressRevealed ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <div className={s.offlineRow}>
        <div className={s.offlineInfo}>
          <div className={s.offlineLabel}>
            {isOffline ? "Offline" : "Online"}
          </div>
          <div className={s.offlineHint}>
            {isOffline
              ? "You're invisible — no one can discover you"
              : "Discoverable by peers on your network"}
          </div>
        </div>
        <Switch
          checked={!isOffline}
          disabled={offlineBusy}
          onCheckedChange={(checked) => toggleOffline(!checked)}
          aria-label={isOffline ? "Go online" : "Go offline"}
        />
      </div>
    </div>
  );
}
