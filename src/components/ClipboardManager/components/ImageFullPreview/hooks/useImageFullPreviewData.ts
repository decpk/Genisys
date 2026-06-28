import { useEffect, useState } from 'react'
import type { ImageFullPreviewProps } from '../ImageFullPreview.types'

export function useImageFullPreviewData(props: ImageFullPreviewProps) {
  const { imagePath } = props

  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!imagePath) { setError(true); return }
    let cancelled = false
    setLoading(true)
    setDataUrl(null)
    setError(false)

    window.api.getClipboardImage(imagePath).then((result: any) => {
      if (cancelled) return
      if (result.success) {
        setDataUrl(result.dataUrl)
      } else {
        setError(true)
      }
      setLoading(false)
    }).catch(() => {
      if (!cancelled) { setError(true); setLoading(false) }
    })

    return () => { cancelled = true }
  }, [imagePath])

  return {
    dataUrl,
    error,
    loading,
  }
}
