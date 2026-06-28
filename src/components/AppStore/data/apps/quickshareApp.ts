import { FolderInput, QrCode, Share2, Wifi } from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const quickshareApp: AppCatalogEntry = {
  id: 'quickshare',
  name: 'QuickShare',
  tagline: 'Send & receive anything with one QR code.',
  description:
    'Turn this machine into a local drop hub. Start QuickShare to show a QR code; any phone or computer on the same Wi-Fi can scan it to send and receive files, photos, videos, and text — no app or sign-in needed. Everyone who scans shares one live tray, and received files auto-save to your Downloads/QuickShare folder.',
  category: 'system',
  icon: Share2,
  accentColor: '#14B8A6',
  features: [
    {
      icon: QrCode,
      title: 'Scan to connect',
      description: 'Any device joins by scanning a single QR code — nothing to install.',
    },
    {
      icon: FolderInput,
      title: 'Files, media & text',
      description: 'Send multiple files of any type, or paste text and links both ways.',
    },
    {
      icon: Share2,
      title: 'Shared with everyone',
      description: 'Every device that scans sees the same tray and can grab any item.',
    },
    {
      icon: Wifi,
      title: 'Stays on your LAN',
      description: 'Transfers go straight over your local network — nothing hits the cloud.',
    },
  ],
  version: '1.0',
}
