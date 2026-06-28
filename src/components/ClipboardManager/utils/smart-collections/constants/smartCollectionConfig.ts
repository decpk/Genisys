import {
  Link,
  Code,
  Palette,
  Mail,
  Braces,
  Terminal,
  FolderOpen,
  Phone,
} from 'lucide-react'
import type { SmartCollectionKey, SmartCollectionConfig } from '../smartCollections.types'

export const SMART_COLLECTION_CONFIGS: Record<SmartCollectionKey, SmartCollectionConfig> = {
  url: { key: 'url', label: 'URLs & Links', icon: 'Link' },
  code: { key: 'code', label: 'Code Snippets', icon: 'Code' },
  color: { key: 'color', label: 'Colors', icon: 'Palette' },
  email: { key: 'email', label: 'Emails', icon: 'Mail' },
  json: { key: 'json', label: 'JSON / Config', icon: 'Braces' },
  shell: { key: 'shell', label: 'Shell Commands', icon: 'Terminal' },
  filepath: { key: 'filepath', label: 'File Paths', icon: 'FolderOpen' },
  phone: { key: 'phone', label: 'Phone Numbers', icon: 'Phone' },
}

export const SMART_COLLECTION_ICON_MAP = {
  Link,
  Code,
  Palette,
  Mail,
  Braces,
  Terminal,
  FolderOpen,
  Phone,
} as const

export const SMART_COLLECTION_ORDER: SmartCollectionKey[] = [
  'url',
  'code',
  'color',
  'email',
  'json',
  'shell',
  'filepath',
  'phone',
]
