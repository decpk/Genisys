export function ThemePreviewToolbar(): React.JSX.Element {
  return (
    <div
      className="h-9 flex items-center gap-2 px-3 border-b"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <button
        type="button"
        className="text-[11px] font-medium px-2.5 py-1 rounded-md cursor-default"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-foreground)',
        }}
      >
        Save
      </button>
      <button
        type="button"
        className="text-[11px] font-medium px-2.5 py-1 rounded-md cursor-default"
        style={{
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-secondary-foreground)',
        }}
      >
        Cancel
      </button>
      <div
        className="ml-auto text-[10px] tabular-nums"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        Saved 2 min ago
      </div>
    </div>
  )
}
