export const STYLES = {
  container: 'flex flex-col h-full',
  header:
    'flex items-center gap-2 px-4 py-2 border-b border-border bg-background/95 backdrop-blur-sm shrink-0',
  headerTitle: 'flex-1 min-w-0',
  headerName: 'text-xs font-medium text-foreground truncate',
  headerUrl: 'text-[10px] text-muted-foreground truncate',
  headerActions: 'flex items-center gap-1 shrink-0',
  headerButton:
    'flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer',
  iframe: 'flex-1 w-full border-none',
  loadingContainer: 'flex-1 flex items-center justify-center',
  loadingText: 'text-xs text-muted-foreground',
} as const
