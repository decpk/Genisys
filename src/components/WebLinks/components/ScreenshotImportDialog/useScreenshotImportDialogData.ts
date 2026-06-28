import { useCallback, useRef, useState } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { scopedToast } from '@/frameworks/notification'

import type {
  ScreenshotImportDialogViewModel,
  ScreenshotImportStatus,
} from './ScreenshotImportDialog.types'
import { computeScreenshotView } from './utils/computeScreenshotView'
import { errorMessage } from './utils/errorMessage'

const toast = scopedToast('weblinks')

/**
 * Drives the screenshot-import dialog: accepts an image (drop / paste / file
 * picker), reads it as a base64 data URL, then asks the vision backend for
 * candidate URLs. State is reset on open with the render-phase previous-value
 * pattern so no setState-in-effect is needed (the repo lints that as an error).
 */
export function useScreenshotImportDialogData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
): ScreenshotImportDialogViewModel {
  const extractUrlsFromImage = useWebLinksStore((state) => state.extractUrlsFromImage)
  const openInBrowser = useWebLinksStore((state) => state.openInBrowser)
  const addLink = useWebLinksStore((state) => state.addLink)
  const selectedFolder = useWebLinksStore((state) => state.selectedFolder)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [urls, setUrls] = useState<string[]>([])
  const [status, setStatus] = useState<ScreenshotImportStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [prevOpen, setPrevOpen] = useState(open)

  const reset = useCallback(() => {
    setImageDataUrl(null)
    setUrls([])
    setStatus('idle')
    setError(null)
  }, [])

  // Reset state each time the dialog opens (render-phase pattern, not an effect).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) reset()
  }

  const handleImage = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : null
        if (!dataUrl) {
          setError('Could not read that image.')
          setStatus('error')
          return
        }
        setImageDataUrl(dataUrl)
        setError(null)
        setStatus('extracting')
        void (async () => {
          try {
            const found = await extractUrlsFromImage(dataUrl)
            setUrls(found)
            setStatus('done')
          } catch (caught) {
            setError(errorMessage(caught))
            setStatus('error')
          }
        })()
      }
      reader.onerror = () => {
        setError('Could not read that image.')
        setStatus('error')
      }
      reader.readAsDataURL(file)
    },
    [extractUrlsFromImage],
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) handleImage(file)
    },
    [handleImage],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const onPaste = useCallback(
    (event: React.ClipboardEvent) => {
      const items = event.clipboardData.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item.type.startsWith('image/')) continue
        const file = item.getAsFile()
        if (file) {
          handleImage(file)
          break
        }
      }
    },
    [handleImage],
  )

  const onChooseImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) handleImage(file)
      event.target.value = ''
    },
    [handleImage],
  )

  const onOpenUrl = useCallback(
    (url: string) => {
      void openInBrowser(url)
    },
    [openInBrowser],
  )

  const onSaveUrl = useCallback(
    (url: string) => {
      const targetFolderId =
        selectedFolder !== 'all' && selectedFolder !== 'unfiled' ? selectedFolder : null
      void (async (): Promise<void> => {
        try {
          const saved = await addLink(url, targetFolderId)
          toast.success(`Saved "${saved.title || saved.url}"`, { duration: 1800 })
        } catch (caught) {
          toast.error(errorMessage(caught))
        }
      })()
      onOpenChange(false)
    },
    [addLink, selectedFolder, onOpenChange],
  )

  const onOpenAll = useCallback(() => {
    for (const url of urls) void openInBrowser(url)
  }, [urls, openInBrowser])

  const view = computeScreenshotView(status)

  return {
    view,
    imageDataUrl,
    urls,
    error,
    fileInputRef,
    onPaste,
    onDrop,
    onDragOver,
    onChooseImage,
    onFileChange,
    onOpenUrl,
    onSaveUrl,
    onOpenAll,
    onReset: reset,
  }
}
