export const notesPanelStyles = {
  container: 'flex flex-col h-full',
  header: 'shrink-0 px-3 pt-3 pb-2 flex items-center justify-between gap-2',
  headerTitle: 'text-[13px] font-semibold text-foreground',
  headerActions: 'flex items-center gap-1',
  addButton: 'w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
  scopeRow: 'shrink-0 px-3 pb-2',
  listArea: 'flex-1 overflow-y-auto',
  emptyState: 'flex flex-col items-center justify-center h-full text-muted-foreground/40 px-8 gap-2',
  editorArea: 'flex flex-col h-full',
  backRow: 'shrink-0 px-3 pt-2 pb-1 flex items-center gap-1.5',
  backButton: 'flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer',
} as const

export const noteItemStyles = {
  base: 'group w-full text-left px-3 py-2.5 transition-all duration-100 cursor-pointer',
  active: 'bg-primary/[0.07]',
  idle: 'hover:bg-secondary/40',
  title: 'text-[12px] font-medium text-foreground truncate',
  titleEmpty: 'text-[12px] font-medium text-muted-foreground/40 italic truncate',
  meta: 'flex items-center gap-1.5 mt-0.5',
  timestamp: 'text-[10px] text-muted-foreground/40',
  pinIndicator: 'text-primary/60',
  actions: 'opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-auto transition-opacity',
  actionButton: 'w-5 h-5 flex items-center justify-center rounded-md hover:bg-foreground/10 text-muted-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer',
  separator: 'mx-3 h-px bg-border/20',
} as const

export const noteEditorStyles = {
  titleInput:
    "w-full bg-transparent text-[14px] font-semibold text-foreground placeholder:text-muted-foreground/30 outline-none px-3 py-2 border-b border-transparent focus:border-input",
  editorContainer: "flex-1 overflow-y-auto px-3 py-2",
  proseMirror:
    "[&_.ProseMirror]:outline-none [&_.ProseMirror]:text-[13px] [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-foreground [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror_h1]:text-lg [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-1.5 [&_.ProseMirror_h3]:text-sm [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_p]:mb-1 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-1 [&_.ProseMirror_code]:bg-muted/50 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-[12px] [&_.ProseMirror_code]:[&_.ProseMirror_pre]:bg-muted/30 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:mb-2 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-primary/30 [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_hr]:border-border/30 [&_.ProseMirror_.is-editor-empty.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty.is-empty::before]:text-muted-foreground/30 [&_.ProseMirror_.is-editor-empty.is-empty::before]:float-left [&_.ProseMirror_.is-editor-empty.is-empty::before]:h-0 [&_.ProseMirror_.is-editor-empty.is-empty::before]:pointer-events-none",
} as const;

export const scopeSelectorStyles = {
  trigger: 'flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-secondary/50 border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-all cursor-pointer',
  triggerLabel: 'truncate max-w-[160px]',
  content: 'min-w-[180px]',
  item: 'flex items-center gap-2 text-[12px]',
} as const
