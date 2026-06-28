import { BookText, Code2, FileText, FileUp, Globe } from 'lucide-react'

import type {
  ImportDestinationOption,
  ImportSourceOption,
} from './ImportWebpageDialog.types'

export const SOURCE_OPTIONS: ImportSourceOption[] = [
  {
    value: 'url',
    label: 'URL',
    description: 'Fetch a live web page',
    icon: Globe,
  },
  {
    value: 'html',
    label: 'Paste HTML',
    description: 'Paste raw markup',
    icon: Code2,
  },
  {
    value: 'file',
    label: 'Upload File',
    description: 'Local .html / .htm',
    icon: FileUp,
  },
]

export const DESTINATION_OPTIONS: ImportDestinationOption[] = [
  {
    value: 'page',
    label: 'Saved Page',
    description: 'Read offline as one page',
    icon: FileText,
  },
  {
    value: 'book',
    label: 'Book',
    description: 'Split into chapters',
    icon: BookText,
  },
]

export const DEFAULT_BOOK_TITLE = 'Imported Page'

export const SOURCE_FIELD_LABELS: Record<string, string> = {
  url: 'Page URL',
  html: 'Raw HTML',
  file: 'HTML file',
}
