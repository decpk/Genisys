export interface CollapsibleSectionProps {
  title: string
  count: number
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  hideCount?: boolean
}
