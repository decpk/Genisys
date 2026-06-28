import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeProps {
  value: string
  size?: number
  className?: string
}

/**
 * Renders `value` as a QR code (PNG data URL) for scanning. Generation is async
 * and cancellation-safe; a same-size placeholder holds layout while it renders.
 */
export function QrCode({ value, size = 216, className }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url)
          setFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (failed) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        role="img"
        aria-label="QR code failed to render"
      />
    )
  }

  if (!dataUrl) {
    return <div className={className} style={{ width: size, height: size }} aria-hidden="true" />
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt="Scan to open the live camera view"
      className={className}
    />
  )
}
