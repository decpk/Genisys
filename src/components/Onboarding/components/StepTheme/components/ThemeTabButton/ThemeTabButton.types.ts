import type { ReactNode } from 'react'

export interface ThemeTabButtonProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}
