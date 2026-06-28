import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { toggleActiveSidebar } from '@/store/panel-toggle-registry'

export function useToggleSidebarAction(): void {
  useBindShortcutActions({
    'global.toggleSidebar': toggleActiveSidebar,
  })
}
