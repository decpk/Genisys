export interface ThemePreviewSidebarItemProps {
  label: string
  active: boolean
}

export function ThemePreviewSidebarItem(props: ThemePreviewSidebarItemProps): React.JSX.Element {
  const { label, active } = props

  let backgroundColor = 'transparent'
  let color = 'var(--color-sidebar-foreground)'
  if (active) {
    backgroundColor = 'var(--color-sidebar-accent)'
    color = 'var(--color-sidebar-accent-foreground)'
  }

  return (
    <li
      className="text-[11px] px-2 py-1.5 rounded-md cursor-default"
      style={{ backgroundColor, color }}
    >
      {label}
    </li>
  )
}
