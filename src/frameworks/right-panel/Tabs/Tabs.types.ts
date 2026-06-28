export interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  registerTab: (value: string, el: HTMLButtonElement | null) => void
  listRef: React.RefObject<HTMLDivElement | null>
  iconsOnly: boolean
}

export interface TabsProps extends React.ComponentProps<'div'> {
  value: string
  onValueChange: (value: string) => void
}
