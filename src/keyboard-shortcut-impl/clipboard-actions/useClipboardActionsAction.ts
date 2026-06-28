import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'

export function useClipboardActionsAction(): void {
  useBindShortcutActions({
    'clipboard.focusSearch': () => {
      window.dispatchEvent(new Event('clipboard:focus-search'))
    },
  })
}
