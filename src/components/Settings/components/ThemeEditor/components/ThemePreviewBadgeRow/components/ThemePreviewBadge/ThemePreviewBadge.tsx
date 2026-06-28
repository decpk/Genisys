export interface ThemePreviewBadgeProps {
  bg: string
  fg: string
  label: string
}

export function ThemePreviewBadge(props: ThemePreviewBadgeProps): React.JSX.Element {
  const { bg, fg, label } = props
  return (
    <span
      className="text-[9px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </span>
  )
}
