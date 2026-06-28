import { Check } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'
import { createElement } from 'react'

const toast = scopedToast('clipboard')

export function copyToClipboard(text: string, label = 'Path'): void {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied to clipboard`, {
    icon: createElement(Check, { size: 14 }),
    duration: 2000
  })
}
