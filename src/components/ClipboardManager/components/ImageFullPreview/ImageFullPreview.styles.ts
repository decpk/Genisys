export const imageFullPreviewStyles = {
  container: 'flex flex-row h-full',
  imageWrapper: 'flex-1 flex items-center justify-center p-4 bg-muted/20 min-h-0 min-w-0 overflow-auto',
  image: 'max-w-full max-h-full object-contain rounded',
  infoColumn: 'w-[350px] shrink-0 border-l border-border/30 h-full flex flex-col min-h-0',
  errorContainer: 'flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground',
  errorText: 'text-sm',
} as const
