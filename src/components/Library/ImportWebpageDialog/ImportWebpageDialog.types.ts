import type { LucideIcon } from 'lucide-react'

export interface ImportWebpageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Where the content to import comes from. */
export type ImportSource = 'url' | 'html' | 'file'

/** What the imported content becomes inside the Library. */
export type ImportDestination = 'page' | 'book'

export interface ImportSourceOption {
  value: ImportSource
  label: string
  description: string
  icon: LucideIcon
}

export interface ImportDestinationOption {
  value: ImportDestination
  label: string
  description: string
  icon: LucideIcon
}
