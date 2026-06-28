export const promptPickerPromptPreviewStyles = {
  // Passed as `className` to `HoverCardContent`. Overrides the default
  // `w-72 z-50` from `@/components/ui/hover-card`. Must sit above the
  // parent PromptPicker popover (which uses `z-50`) so the preview is
  // visually on top.
  container:
    'w-[420px] max-h-[60vh] z-[60] p-0 flex flex-col overflow-hidden',
  header:
    'flex items-center gap-2 px-3 py-2 border-b border-border/40 shrink-0',
  title:
    'flex-1 min-w-0 truncate text-[12.5px] font-medium text-foreground',
  copyBtn:
    'shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer',
  description:
    'px-3 py-1.5 text-[11px] text-muted-foreground border-b border-border/40 shrink-0',
  body:
    'flex-1 min-h-0 overflow-y-auto px-3 py-2',
}
