export function ThemePreviewTitleBar(): React.JSX.Element {
  return (
    <div
      className="h-8 flex items-center gap-1.5 px-3 border-b"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: 'var(--color-destructive)' }}
      />
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: 'var(--color-warning)' }}
      />
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: 'var(--color-success)' }}
      />
      <span
        className="ml-3 text-[10px] font-medium"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        Genisys — Preview
      </span>
    </div>
  )
}
