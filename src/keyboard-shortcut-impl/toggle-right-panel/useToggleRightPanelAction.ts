import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { toggleActiveRightPanel } from '@/store/panel-toggle-registry'

export function useToggleRightPanelAction(): void {
  useBindShortcutActions({
    'global.toggleRightPanel': toggleActiveRightPanel,
  })
}
