export const styles = {
  container: "flex flex-col h-full",
  header:
    "flex items-center gap-2 px-3 py-2 border-b border-border/40 shrink-0",
  headerIcon:
    "flex items-center justify-center size-5 rounded-md bg-purple-500/10 shrink-0",
  headerIconSvg: "size-3 text-purple-500",
  headerTitle: "text-xs font-semibold text-foreground flex-1",
  headerDate: "text-[10px] text-muted-foreground",
  copyButton:
    "p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
  copiedIcon: "size-3 text-green-500",
  copyIcon: "size-3",
  editorArea: "flex-1 overflow-y-auto p-3",
  editorWrapper:
    "rounded-lg bg-muted/20 border border-border/20 min-h-full flex flex-col",
  editor: "p-0 daily-status-editor flex flex-col flex-1",
} as const;
