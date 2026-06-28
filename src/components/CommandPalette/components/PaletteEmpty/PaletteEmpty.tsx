export function PaletteEmpty() {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
      <div>No matches</div>
      <div className="text-xs">
        Type <kbd className="rounded border border-border bg-muted px-1">{'>'}</kbd> for commands ·{' '}
        <kbd className="rounded border border-border bg-muted px-1">@notes</kbd> to filter notes
      </div>
    </div>
  )
}
