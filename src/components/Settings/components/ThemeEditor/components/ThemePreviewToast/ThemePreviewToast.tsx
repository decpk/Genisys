import { Bell } from 'lucide-react'

export function ThemePreviewToast(): React.JSX.Element {
  return (
    <div
      className="m-3 mt-0 px-3 py-2 rounded-md flex items-center gap-2 border shadow-sm"
      style={{
        backgroundColor: 'var(--color-popover)',
        color: 'var(--color-popover-foreground)',
        borderColor: 'var(--color-border)',
      }}
    >
      <Bell size={12} style={{ color: 'var(--color-info)' }} />
      <span className="text-[10px] font-medium">Note saved automatically</span>
      <span
        className="ml-auto text-[9px]"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        just now
      </span>
    </div>
  )
}
