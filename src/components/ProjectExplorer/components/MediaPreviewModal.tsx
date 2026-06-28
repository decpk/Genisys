import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('explorer')

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { RepoInfo } from '../ProjectExplorer.types'

const MEDIA_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac'
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp'])
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.ogg', '.mov'])
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.flac', '.aac', '.ogg'])

function getExt(path: string): string {
  const dot = path.lastIndexOf('.')
  return dot === -1 ? '' : path.slice(dot).toLowerCase()
}

export function isMediaFile(path: string): boolean {
  const ext = getExt(path)
  return IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext) || AUDIO_EXTS.has(ext)
}

function getMediaType(ext: string): 'image' | 'video' | 'audio' {
  if (VIDEO_EXTS.has(ext)) return 'video'
  if (AUDIO_EXTS.has(ext)) return 'audio'
  return 'image'
}

interface MediaPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filePath: string
  objectId: string
  repoInfo: RepoInfo
}

export function MediaPreviewModal({
  open,
  onOpenChange,
  filePath,
  objectId,
  repoInfo
}: MediaPreviewModalProps): React.JSX.Element {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ext = getExt(filePath)
  const mediaType = getMediaType(ext)
  const fileName = filePath.split('/').pop() ?? filePath

  const fetchMedia = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setDataUrl(null)

    const result = await window.api.getLocalMediaDataUrl({
      rootPath: repoInfo.localPath!,
      filePath
    })

    if (result.success && result.dataUrl) {
      setDataUrl(result.dataUrl)
    } else {
      setError(result.error || 'Failed to load media')
      toast.error(result.error || 'Failed to load media')
    }
    setIsLoading(false)
  }, [ext, repoInfo, filePath, objectId])

  useEffect(() => {
    if (open) fetchMedia()
    return () => {
      setDataUrl(null)
      setError(null)
    }
  }, [open, fetchMedia])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[90vw] max-h-[90vh] sm:max-w-[90vw] p-0 overflow-hidden"
      >
        <MediaHeader fileName={fileName} onClose={() => onOpenChange(false)} />

        <div className="flex items-center justify-center min-h-[200px] p-4 overflow-auto">
          {isLoading && <AppLoaderGlyph size={32} className="text-muted-foreground" />}

          {error && <p className="text-sm text-destructive text-center px-4">{error}</p>}

          {dataUrl && mediaType === 'image' && (
            <img
              src={dataUrl}
              alt={fileName}
              className="max-w-full max-h-[75vh] object-contain rounded-md"
            />
          )}

          {dataUrl && mediaType === 'video' && (
            <video src={dataUrl} controls className="max-w-full max-h-[75vh] rounded-md" />
          )}

          {dataUrl && mediaType === 'audio' && (
            <audio src={dataUrl} controls className="w-full max-w-md" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MediaHeader({
  fileName,
  onClose
}: {
  fileName: string
  onClose: () => void
}): React.JSX.Element {
  return (
    <DialogHeader className="flex-row items-center justify-between px-4 py-3 border-b border-border/20 gap-2">
      <DialogTitle className="text-sm font-medium truncate">{fileName}</DialogTitle>
      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>
    </DialogHeader>
  )
}
