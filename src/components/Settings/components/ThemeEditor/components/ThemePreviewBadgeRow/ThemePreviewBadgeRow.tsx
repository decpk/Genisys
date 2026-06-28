import { ThemePreviewBadge } from './components/ThemePreviewBadge'

export function ThemePreviewBadgeRow(): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <ThemePreviewBadge bg="var(--color-success)" fg="#fff" label="success" />
      <ThemePreviewBadge bg="var(--color-warning)" fg="#fff" label="warning" />
      <ThemePreviewBadge bg="var(--color-info)" fg="#fff" label="info" />
      <ThemePreviewBadge
        bg="var(--color-destructive)"
        fg="var(--color-destructive-foreground)"
        label="error"
      />
      <ThemePreviewBadge
        bg="var(--color-accent)"
        fg="var(--color-accent-foreground)"
        label="accent"
      />
    </div>
  )
}
