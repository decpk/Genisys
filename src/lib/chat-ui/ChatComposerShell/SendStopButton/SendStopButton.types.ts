export interface SendStopButtonProps {
  /** When true, renders the stop variant invoking `onStop`. */
  isStreaming?: boolean
  /** Called when the send button is clicked while not streaming. */
  onSend: () => void
  /** Called when the stop button is clicked while streaming. */
  onStop?: () => void
  /** Disables the send button (ignored while streaming). */
  disabled?: boolean
}
