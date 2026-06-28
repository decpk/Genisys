import type { MsgIdentity } from '@/components/Messages/Messages.types'

export interface IdentityCardData {
  identity: MsgIdentity | null
  isEditing: boolean
  draftName: string
  nameRevealed: boolean
  idRevealed: boolean
  addressRevealed: boolean
  isOffline: boolean
  offlineBusy: boolean
  nameText: string
  idText: string
  addressText: string | null
  addressListening: boolean
  startEdit: () => void
  cancelEdit: () => void
  setDraftName: (value: string) => void
  commitName: () => void
  toggleNameReveal: () => void
  toggleIdReveal: () => void
  toggleAddressReveal: () => void
  copyAddress: () => void
  rescan: () => void
  rescanBusy: boolean
  rotate: () => void
  toggleOffline: (nextOffline: boolean) => void
}
