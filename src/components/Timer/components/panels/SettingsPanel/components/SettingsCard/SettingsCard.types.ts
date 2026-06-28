import type { LucideIcon } from 'lucide-react'

export interface SettingsCardProps {
  /** Accordion item value — unique identifier for this card. */
  id: string
  /** Icon component to render in the header. */
  icon: LucideIcon
  /** Main header label. */
  title: string
  /** Optional one-line subtitle rendered below title. */
  description?: string
  /** Optional right-aligned summary chip rendered left of the chevron. */
  summary?: React.ReactNode
  /** Body content rendered inside AccordionContent. */
  children: React.ReactNode
  /** Optional class override for the content padding wrapper. */
  contentClassName?: string
}
