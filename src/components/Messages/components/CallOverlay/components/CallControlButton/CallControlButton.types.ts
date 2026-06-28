export type CallControlVariant = 'default' | 'danger'

export interface CallControlButtonProps {
  icon: React.JSX.Element
  active: boolean
  onClick: () => void
  label: string
  variant: CallControlVariant
}
