export const messageComposerStyles = {
  // Floating overlay: the composer is absolutely positioned over the message
  // list (ConversationView root is `relative`). The root is a non-interactive
  // gradient "fade" strip so messages dissolve behind the floating bar; only
  // the bar + its controls capture pointer events (`pointer-events-auto`).
  root: "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-4 pt-12",
  bar: "pointer-events-auto mx-auto flex w-full items-end gap-1 rounded-full border border-border/70 bg-card/90 p-1.5 shadow-lg backdrop-blur-md focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
  iconButton:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
  iconButtonActive:
    "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
  textarea:
    "max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[13.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60",
  sendButton:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer",
  hidden: "hidden",
  hint: "mx-auto mt-1.5 flex w-full items-center gap-1.5 px-1 text-[10.5px] text-muted-foreground/60",
  hintIcon: "h-3 w-3 text-emerald-500/70",
} as const;
