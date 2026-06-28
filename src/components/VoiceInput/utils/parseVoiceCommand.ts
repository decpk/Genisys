import type { VoiceCommand } from '../VoiceInput.types'

export interface VoiceCommandResult {
  isCommand: boolean
  command: VoiceCommand | null
  remainingText: string
}

interface CommandPattern {
  command: VoiceCommand
  patterns: RegExp[]
}

const COMMAND_PATTERNS: CommandPattern[] = [
  {
    command: 'send',
    patterns: [/send\s+message$/i, /submit$/i, /send\s+it$/i],
  },
  {
    command: 'newline',
    patterns: [/new\s+line$/i, /next\s+line$/i, /line\s+break$/i],
  },
  {
    command: 'clear',
    patterns: [/clear\s+all$/i, /delete\s+all$/i, /clear$/i],
  },
  {
    command: 'stop',
    patterns: [
      /stop\s+listening$/i,
      /stop\s+recording$/i,
      /stop\s+dictation$/i,
    ],
  },
  {
    command: 'undo',
    patterns: [/undo\s+that$/i, /undo$/i],
  },
]

/**
 * Check if transcribed text ends with a voice command.
 * Returns the detected command and any preceding text.
 */
export function parseVoiceCommand(text: string): VoiceCommandResult {
  const trimmed = text.trim()

  for (const { command, patterns } of COMMAND_PATTERNS) {
    for (const pattern of patterns) {
      const match = trimmed.match(pattern)
      if (match) {
        const remaining = trimmed.slice(0, match.index).trim()
        return {
          isCommand: true,
          command,
          remainingText: remaining,
        }
      }
    }
  }

  return {
    isCommand: false,
    command: null,
    remainingText: trimmed,
  }
}
