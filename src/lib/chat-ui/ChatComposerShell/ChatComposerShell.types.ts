import type { ReactNode } from 'react'

export interface ChatComposerShellProps {
  /** Editor element (TipTap, textarea, contenteditable, …) — rendered in the centre. */
  children: ReactNode
  /** Controls placed to the left of the editor (mode picker, model picker, attachments…). */
  leftSlot?: ReactNode
  /** Controls placed between the editor and the mic button (tools popover, etc.). */
  rightSlot?: ReactNode

  /** When true, the send button becomes a stop button calling `onStop`. */
  isStreaming?: boolean
  /** Called when the form is submitted (Enter, send button click). */
  onSubmit: () => void
  /** Called when the user clicks the stop button while `isStreaming`. */
  onStop?: () => void
  /** Disables the send button (e.g. empty editor). Ignored while streaming. */
  isSubmitDisabled?: boolean

  /** When provided, a mic button is rendered between right slot and send. */
  onMicTranscript?: (text: string) => void
  /** Optional voice command handler (`'send'` / `'newline'` / `'clear'` / …). */
  onMicCommand?: (command: string) => void
  /** Disables the mic button. */
  isMicDisabled?: boolean

  /** Extra classes appended to the outer wrapper (controls outer padding). */
  className?: string
}
