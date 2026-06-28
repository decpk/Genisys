import { getFocusedChatSurfaceHandler } from '../registry/getFocusedChatSurfaceHandler'

/**
 * Action handler bound to the `chat.newChat` shortcut. Looks up the chat
 * surface currently containing `document.activeElement` and invokes its
 * "new chat" handler. No-op when focus is outside every registered surface,
 * which lets Cmd/Ctrl+N pass through harmlessly in unrelated apps.
 */
export function handleNewChatShortcut(): void {
  const handler = getFocusedChatSurfaceHandler()
  if (!handler) return
  handler()
}
