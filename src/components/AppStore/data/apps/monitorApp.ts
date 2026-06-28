import { Move, QrCode, ShieldCheck, Webcam, Wifi } from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const monitorApp: AppCatalogEntry = {
  id: 'monitor',
  name: 'Monitor',
  tagline: 'Turn this device into a remote camera & mic.',
  description:
    "Stream this machine's front camera and microphone to a phone or laptop on the same Wi-Fi. Scan a QR code, approve the device here, and watch + listen to your surroundings live over a direct WebRTC connection. The desktop captures; the remote device watches live and can pan, tilt, and zoom the view remotely.",
  category: 'system',
  icon: Webcam,
  accentColor: '#F43F5E',
  features: [
    {
      icon: QrCode,
      title: 'Scan to connect',
      description: 'A device on your Wi-Fi joins by scanning a QR code — no setup.',
    },
    {
      icon: ShieldCheck,
      title: 'Approve every device',
      description: 'Off by default; each device must be allowed on this machine first.',
    },
    {
      icon: Webcam,
      title: 'Live camera & mic',
      description: 'Low-latency audio + video over a direct peer-to-peer WebRTC link.',
    },
    {
      icon: Move,
      title: 'Pan, tilt & zoom',
      description: 'Viewers drag to pan and pinch or scroll to zoom the live view.',
    },
    {
      icon: Wifi,
      title: 'Stays on your LAN',
      description: 'Media never leaves your local network — nothing is sent to the cloud.',
    },
  ],
  version: '1.1',
}
