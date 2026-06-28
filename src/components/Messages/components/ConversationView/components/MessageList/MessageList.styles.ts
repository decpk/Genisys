export const messageListStyles = {
  root: 'flex-1 min-h-0 overflow-y-auto',
  // Extra bottom padding so the last message can scroll clear of the floating
  // composer overlay instead of being hidden behind it.
  inner: 'mx-auto flex w-full flex-col gap-2.5 px-4 pt-5 pb-28',
  typingRow: 'flex justify-start',
} as const
