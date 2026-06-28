import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'

export interface MessageComposerProps {
  peerId: string
  isConnected: boolean
}

export interface MessageComposerData {
  text: string
  isSending: boolean
  canSend: boolean
  placeholder: string
  ephemeralActive: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
  handleChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  handleSend: () => void
  handleAttachClick: () => void
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onToggleEphemeral: () => void
  insertEmoji: (emoji: string) => void
}
