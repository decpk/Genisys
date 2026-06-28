import { BotMessageSquare } from 'lucide-react'

import { useCommandStore } from '@/store/command-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import { truncate } from '../utils/truncate'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const chatCommandsSource: PaletteSource = {
  id: 'chatCommands',
  kinds: ['command'],
  load: async () => {
    try {
      const state = useCommandStore.getState() as { loadCommands?: () => Promise<void> }
      await state.loadCommands?.()
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useCommandStore.getState() as {
        commands?: Array<{ id: string; name: string; description?: string }>
      }
      const commands = state.commands ?? []
      return commands.map((cmd): PaletteItem => ({
        id: `command:chat:${cmd.id}`,
        kind: 'command',
        title: `/${cmd.name}`,
        subtitle: truncate(cmd.description, 80) || 'Chat command',
        icon: BotMessageSquare,
        keywords: ['chat', 'slash', 'command', 'ai', 'prompt', cmd.name],
        group: 'commands',
        action: () =>
          safeRun(() => {
            useNavigationStore.getState().setActiveApp('chat')
            window.dispatchEvent(
              new CustomEvent('chat:command-palette:insert-slash-command', {
                detail: { name: cmd.name },
              }),
            )
          }),
      }))
    } catch {
      return []
    }
  },
}
