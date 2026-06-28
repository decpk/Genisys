import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useCommandPaletteStore } from '@/store/command-palette-store'

export function useCommandPaletteActions(): void {
  const openQuickOpen = useCommandPaletteStore((s) => s.openQuickOpen)
  const openCommands = useCommandPaletteStore((s) => s.openCommands)

  useBindShortcutActions({
    'global.commandPalette.quickOpen': openQuickOpen,
    'global.commandPalette.commands': openCommands,
  })
}
