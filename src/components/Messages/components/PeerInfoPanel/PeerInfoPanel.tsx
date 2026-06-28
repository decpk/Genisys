import { ShieldAlert, ShieldCheck, UserX } from 'lucide-react'

import { Identicon } from '@/components/Messages/components/Identicon'

import { ConnectionDetailsCard } from './components/ConnectionDetailsCard'
import { SafetyNumberCard } from './components/SafetyNumberCard'
import { peerInfoPanelStyles as s } from './PeerInfoPanel.styles'
import { usePeerInfoPanelData } from './usePeerInfoPanelData'

export function PeerInfoPanel(): React.JSX.Element {
  const { peer, isVerifying, fingerprint, safetyNumber, handleVerify } =
    usePeerInfoPanelData()

  if (!peer) {
    return (
      <div className={s.empty}>
        <UserX className={s.emptyIcon} />
        Select a conversation to see encryption details.
      </div>
    )
  }

  let verifyNode: React.JSX.Element
  if (peer.verified) {
    verifyNode = (
      <div className={s.verifiedBox}>
        <ShieldCheck className="h-4 w-4" />
        Verified — safety number confirmed
      </div>
    )
  } else {
    const label = isVerifying ? 'Verifying…' : 'Mark as verified'
    verifyNode = (
      <button
        type="button"
        className={s.verifyButton}
        onClick={handleVerify}
        disabled={isVerifying}
      >
        <ShieldCheck className="h-4 w-4" />
        {label}
      </button>
    )
  }

  let verifiedPill: React.JSX.Element | null = null
  if (peer.verified) {
    verifiedPill = (
      <span className={s.verifiedPill}>
        <ShieldCheck className="h-3 w-3" />
        Verified
      </span>
    )
  }

  let keyChangedNode: React.JSX.Element | null = null
  if (peer.keyChanged) {
    keyChangedNode = (
      <div className={s.warnBox}>
        <ShieldAlert className={s.warnIcon} />
        <span>
          This peer&rsquo;s key changed since you last spoke. Re-verify the
          safety number before trusting this conversation.
        </span>
      </div>
    )
  }

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Identicon seed={peer.publicKey || peer.id} size={56} />
        <span className={s.name}>{peer.displayName}</span>
        {verifiedPill}
      </div>
      <SafetyNumberCard fingerprint={fingerprint} safetyNumber={safetyNumber} />
      {verifyNode}
      {keyChangedNode}
      <ConnectionDetailsCard peer={peer} />
      <div className={s.footer}>
        <ShieldCheck className={s.footerIcon} />
        <span>Verifying the safety number protects against impersonation.</span>
      </div>
    </div>
  )
}
