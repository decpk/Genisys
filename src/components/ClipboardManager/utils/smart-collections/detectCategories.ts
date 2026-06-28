import type { SmartCollectionKey } from './smartCollections.types'
import { detectUrl } from './detectors/detectUrl'
import { detectCode } from './detectors/detectCode'
import { detectColor } from './detectors/detectColor'
import { detectEmail } from './detectors/detectEmail'
import { detectJson } from './detectors/detectJson'
import { detectShellCommand } from './detectors/detectShellCommand'
import { detectFilePath } from './detectors/detectFilePath'
import { detectPhoneNumber } from './detectors/detectPhoneNumber'

type DetectorEntry = {
  key: SmartCollectionKey
  detect: (text: string) => boolean
}

const DETECTORS: DetectorEntry[] = [
  { key: 'url', detect: detectUrl },
  { key: 'code', detect: detectCode },
  { key: 'color', detect: detectColor },
  { key: 'email', detect: detectEmail },
  { key: 'json', detect: detectJson },
  { key: 'shell', detect: detectShellCommand },
  { key: 'filepath', detect: detectFilePath },
  { key: 'phone', detect: detectPhoneNumber },
]

export function detectCategories(text: string): SmartCollectionKey[] {
  if (!text || text.trim().length === 0) return []

  const categories: SmartCollectionKey[] = []

  for (const { key, detect } of DETECTORS) {
    if (detect(text)) {
      categories.push(key)
    }
  }

  return categories
}
