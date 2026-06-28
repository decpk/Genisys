import type { ChatCommand } from '@/store/command-store'

export interface CommandSegment {
  type: 'text' | 'command'
  value: string
  command?: ChatCommand
}

const COMMAND_RE = /\/(\w+)/g

/**
 * Parse text into segments, identifying known `/command` tokens.
 * Unknown `/words` are treated as plain text.
 */
export function parseCommandTokens(
  text: string,
  commands: ChatCommand[],
): CommandSegment[] {
  if (!text) return []

  const commandMap = new Map(commands.map((c) => [c.name.toLowerCase(), c]))
  const segments: CommandSegment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(COMMAND_RE)) {
    const name = match[1].toLowerCase()
    const cmd = commandMap.get(name)
    if (!cmd) continue

    const start = match.index!
    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) })
    }
    segments.push({ type: 'command', value: match[0], command: cmd })
    lastIndex = start + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }]
}

/**
 * Extract all recognized commands from the text.
 */
export function extractCommands(
  text: string,
  commands: ChatCommand[],
): ChatCommand[] {
  return parseCommandTokens(text, commands)
    .filter((s): s is CommandSegment & { command: ChatCommand } => s.type === 'command')
    .map((s) => s.command)
}
