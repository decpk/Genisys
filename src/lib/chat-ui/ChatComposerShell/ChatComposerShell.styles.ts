/**
 * Tailwind class objects for the shared chat composer shell.
 * Uses the same rounded-2xl card + focus-ring treatment everywhere
 * so Chat and every AI Assistant input bar look identical.
 */
export const chatComposerShellStyles = {
  outer: 'px-3 pb-2 pt-1.5 shrink-0',
  bar:
    'mx-auto flex items-center gap-1 rounded-2xl border border-transparent bg-card shadow-sm transition-all focus-within:border-input focus-within:ring-1 focus-within:ring-ring/20 px-1.5 py-1',
  leftSlot: 'flex items-center gap-0.5 shrink-0',
  rightSlot: 'flex items-center gap-0.5 shrink-0',
  editorWrapper: 'flex-1 min-w-0',
} as const
