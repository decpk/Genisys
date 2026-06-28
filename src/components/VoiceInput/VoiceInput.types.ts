export type VoiceCommand = 'send' | 'newline' | 'clear' | 'stop' | 'undo'
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown'
export type VoiceInputStatus = 'idle' | 'listening' | 'processing'
export type WhisperModel = 'tiny' | 'base' | 'small' | 'medium' | 'large'

export interface WhisperChunkEvent {
  streamId: string
  text: string
  startMs: number
  endMs: number
  isFinal: boolean
}

export interface WhisperModelInfo {
  name: WhisperModel
  size: number
  path: string
  downloaded: boolean
}

export interface VoiceInputContextValue {
  startVoiceInput: (
    onTranscript: (text: string) => void,
    onCommand?: (cmd: VoiceCommand) => void
  ) => Promise<void>
  stopVoiceInput: () => void
  isListening: boolean
  audioLevel: number
  transcript: string
  interimText: string
  error: string | null
  permissionState: PermissionState
}

export interface MicButtonProps {
  onTranscript: (text: string) => void
  onCommand?: (command: VoiceCommand) => void
  size?: number
  className?: string
  disabled?: boolean
  commandsEnabled?: boolean
}
