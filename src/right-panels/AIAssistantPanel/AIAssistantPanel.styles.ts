export const headerStyles = {
  root: 'flex items-center justify-between px-3 h-9 shrink-0',
  title: 'flex items-center gap-1.5',
  titleIcon: 'text-primary',
  titleText: 'text-xs font-semibold',
  actions: 'flex items-center gap-1',
  newChatButton:
    'flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer',
  resetButton: 'h-6 px-1.5 text-[10px] text-muted-foreground bg-secondary/60 hover:bg-secondary',
} as const

export const historyStyles = {
  root: 'border-b border-border/30 shrink-0',
  toggleButton:
    'w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors cursor-pointer',
  count: 'text-muted-foreground/50 tabular-nums',
  triggerChevron: 'ml-auto text-muted-foreground/50',
  itemSuffix: 'flex items-center gap-1 shrink-0',
  itemTime: 'text-[9px] text-muted-foreground/50 tabular-nums',
  itemRemove:
    'inline-flex items-center justify-center p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer',
} as const

export const sessionItemStyles = {
  root: 'group flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-all duration-150',
  active: 'bg-primary/10 text-foreground',
  idle: 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
  iconActive: 'text-primary shrink-0',
  iconIdle: 'text-muted-foreground/50',
  title: 'flex-1 truncate text-[10px] font-medium',
  time: 'text-[9px] text-muted-foreground/50 tabular-nums shrink-0',
  removeButton:
    'p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer shrink-0',
} as const

export const messagesStyles = {
  root: 'flex-1 overflow-y-auto px-3 py-3 min-h-0',
} as const

export const messageBubbleStyles = {
  separatorWrapper: "my-10 flex items-center gap-2 px-4",
  separatorLine:
    "flex-1 h-px bg-gradient-to-r from-transparent via-primary/25 to-primary/8",
  separatorLineReverse:
    "flex-1 h-px bg-gradient-to-l from-transparent via-primary/25 to-primary/8",
  separatorIcon: "text-primary/35 shrink-0",
  userWrapper: "flex justify-end",
  userInner: "flex flex-col items-end gap-0.5 max-w-[90%]",
  userBubble:
    "w-full bg-primary/80 text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 text-[11.5px] shadow-sm",
  assistantWrapper: "mb-4",
  assistantBubble: "text-[11.5px] prose-sm",
} as const;

export const toolActivityStyles = {
  root: "mt-1.5 mb-1.5 space-y-0.5",
  item: "flex items-center gap-1.5 text-[10px] text-muted-foreground py-0.5",
  runningIcon: "text-primary",
  doneIcon: "text-green-500",
  label: "truncate",
} as const;

export const streamingStyles = {
  content: 'mt-2 text-xs',
  indicator: 'flex items-center gap-2 mt-2 text-xs text-muted-foreground',
} as const

export const errorStyles = {
  root: 'mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs',
  header: 'flex items-center gap-1.5 font-medium',
  message: 'mt-1 text-[10px]',
  detailsToggle:
    'mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-destructive/70 hover:text-destructive cursor-pointer transition-colors',
  details:
    'mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded border border-destructive/20 bg-background/40 p-1.5 font-mono text-[9px] leading-relaxed text-muted-foreground',
  resendButton:
    'mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-destructive/80 hover:text-destructive cursor-pointer transition-colors',
} as const

export const contextStyles = {
  root: 'flex flex-wrap items-center gap-1 px-3 py-1.5 border-t border-border/30 shrink-0 overflow-hidden',
  label:
    'text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mr-1 shrink-0',
  chip:
    'inline-flex items-center gap-1 h-[18px] rounded-[3px] px-1.5 bg-secondary/60 hover:bg-secondary text-foreground/90 transition-colors max-w-[180px] cursor-pointer',
  chipNonInteractive:
    'inline-flex items-center gap-1 h-[18px] rounded-[3px] px-1.5 bg-secondary/60 text-foreground/90 max-w-[180px]',
  chipIcon: 'shrink-0 text-foreground/60',
  chipLabel: 'text-[10px] truncate leading-none',
  removeButton:
    'inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm hover:bg-destructive/20 hover:text-destructive text-foreground/50 shrink-0 cursor-pointer',
} as const

export const emptyStateStyles = {
  root: 'flex flex-col items-center justify-center h-full text-center gap-3 py-6 px-3',
  heroBadge:
    'relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-[0_0_24px_-6px_rgb(var(--color-primary-rgb,99_102_241)/0.35)]',
  icon: 'text-primary',
  title: 'text-sm font-medium text-foreground',
  subtitle: 'mt-0.5 text-[11px] text-muted-foreground/70',
  suggestions: 'mt-3 flex flex-col gap-1.5 w-full max-w-full',
  suggestionButton:
    'group relative flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl border border-border/50 bg-gradient-to-b from-secondary/40 to-secondary/20 hover:from-secondary/70 hover:to-secondary/40 hover:border-primary/30 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer text-left',
  suggestionIconWrap:
    'flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors',
  suggestionLabel:
    'flex-1 text-[11px] text-foreground/80 group-hover:text-foreground leading-snug whitespace-normal break-words',
  suggestionArrow:
    'shrink-0 text-muted-foreground/0 group-hover:text-primary transition-colors',
} as const

export const inputStyles = {
  form: "px-3 pb-2 shrink-0",
  bar: "flex items-center gap-1 rounded-lg border border-border/40 bg-secondary/50 px-1 py-0.5",
  divider: "w-px h-4 bg-border/40 shrink-0",
  sendButton: "h-6 w-6 p-0 shrink-0",
} as const;

export const followButtonStyles = {
  wrapper: 'relative shrink-0',
  button:
    'absolute -top-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium shadow-md hover:bg-primary/90 transition-colors cursor-pointer',
} as const

export const queuedStyles = {
  root: 'flex flex-col gap-1 px-3 pb-1.5 shrink-0',
  label:
    'text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60',
  chip:
    'group flex items-center gap-1.5 rounded-md border border-border/40 bg-secondary/40 px-2 py-1',
  chipIcon: 'shrink-0 text-muted-foreground/70',
  chipText: 'flex-1 truncate text-[10.5px] text-foreground/80',
  chipRemove:
    'inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm text-foreground/50 hover:bg-destructive/20 hover:text-destructive shrink-0 cursor-pointer transition-colors',
} as const

export const modeSelectorStyles = {
  trigger:
    'h-7 shrink-0 rounded-md flex items-center gap-1 px-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer',
  label: 'text-[10px] font-medium',
} as const

export const contextScopePillStyles = {
  root:
    'h-7 shrink-0 inline-flex items-center gap-0.5 rounded-md border border-border/40 bg-secondary/40 p-0.5',
  item:
    'h-6 inline-flex items-center gap-1 px-1.5 rounded-[5px] text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors cursor-pointer data-[state=on]:bg-primary/15 data-[state=on]:text-foreground data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent',
  label: 'text-[10px] font-medium leading-none',
} as const
