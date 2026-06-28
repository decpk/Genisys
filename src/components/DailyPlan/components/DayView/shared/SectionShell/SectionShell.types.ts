import type { ReactNode } from 'react'
import type { SectionVariant } from '../constants/sectionVariants.constants'

export interface SectionShellProps {
  /** Drives outer ring, shadow halo, and gradient overlay color. */
  variant: SectionVariant
  /** Header + body content rendered inside the glass shell. */
  children: ReactNode
}
