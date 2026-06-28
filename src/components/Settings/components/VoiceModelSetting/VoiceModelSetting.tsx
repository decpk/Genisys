import { memo, useState, useEffect, useCallback } from 'react'
import { Download, Trash2, Check, FolderOpen } from 'lucide-react'
import { AppInlineLoader, AppLoaderGlyph } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('settings')
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settings-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SettingRow } from '../SettingRow'

interface WhisperModel {
  name: string
  size: number
  path: string
  downloaded: boolean
}

interface DownloadProgress {
  modelName: string
  downloadedBytes: number
  totalBytes: number
  percent: number
}

const MODEL_SIZE_LABELS: Record<string, string> = {
  tiny: '~75 MB',
  base: '~150 MB',
  small: '~500 MB',
  medium: '~1.5 GB',
  large: '~3 GB',
}

const MODEL_DESCRIPTIONS: Record<string, string> = {
  tiny: 'Fastest, lower accuracy. Best for quick drafts and real-time use. English-focused.',
  base: 'Good balance of speed and accuracy. Multilingual support. Recommended for most users.',
  small: 'Higher accuracy, moderate speed. Good multilingual transcription.',
  medium: 'High accuracy, slower processing. Strong multilingual performance across 100+ languages.',
  large: 'Best accuracy, slowest. Professional-grade transcription across 100+ languages.',
}

const MODEL_ORDER = ['tiny', 'base', 'small', 'medium', 'large']

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export const VoiceModelSetting = memo(function VoiceModelSetting(): React.JSX.Element {
  const voiceModel = useSettingsStore((s) => s.voiceModel)
  const setVoiceModel = useSettingsStore((s) => s.setVoiceModel)

  const [models, setModels] = useState<WhisperModel[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [deletingModel, setDeletingModel] = useState<string | null>(null)

  const fetchModels = useCallback(async () => {
    try {
      const result = await window.api.whisperListModels()
      const sorted = [...result.models].sort(
        (a, b) => MODEL_ORDER.indexOf(a.name) - MODEL_ORDER.indexOf(b.name)
      )
      setModels(sorted)
    } catch {
      toast.error('Failed to load voice models')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  useEffect(() => {
    const unsubProgress = window.api.onWhisperModelDownloadProgress((data: DownloadProgress) => {
      setDownloadProgress(data)
    })

    const unsubDone = window.api.onWhisperModelDownloadDone((data: { modelName: string }) => {
      setDownloadingModel(null)
      setDownloadProgress(null)
      toast.success(`Model "${data.modelName}" downloaded successfully`)
      fetchModels()
    })

    return () => {
      unsubProgress()
      unsubDone()
    }
  }, [fetchModels])

  const handleDownload = useCallback(
    async (modelName: string) => {
      setDownloadingModel(modelName)
      setDownloadProgress({ modelName, downloadedBytes: 0, totalBytes: 0, percent: 0 })
      try {
        await window.api.whisperDownloadModel(modelName)
      } catch {
        setDownloadingModel(null)
        setDownloadProgress(null)
        toast.error(`Failed to download model "${modelName}"`)
      }
    },
    []
  )

  const handleDelete = useCallback(
    async (modelName: string) => {
      setDeletingModel(modelName)
      try {
        await window.api.whisperDeleteModel(modelName)
        toast.success(`Model "${modelName}" deleted`)
        if (voiceModel === modelName) {
          const remaining = models.filter((m) => m.downloaded && m.name !== modelName)
          if (remaining.length > 0) {
            setVoiceModel(remaining[0].name)
          }
        }
        await fetchModels()
      } catch {
        toast.error(`Failed to delete model "${modelName}"`)
      } finally {
        setDeletingModel(null)
      }
    },
    [voiceModel, models, setVoiceModel, fetchModels]
  )

  const handleSelect = useCallback(
    (modelName: string) => {
      setVoiceModel(modelName)
      toast.success(`Voice model set to "${modelName}"`)
    },
    [setVoiceModel]
  )

  const isDownloading = downloadingModel !== null

  const loadingContent = (
    <div className="flex items-center justify-center py-6">
      <AppInlineLoader message="Loading models…" size={16} />
    </div>
  )

  const modelList = models.map((model) => {
    const isActive = voiceModel === model.name
    const isThisDownloading = downloadingModel === model.name
    const isThisDeleting = deletingModel === model.name
    const sizeLabel = model.downloaded
      ? formatFileSize(model.size)
      : (MODEL_SIZE_LABELS[model.name] ?? 'Unknown')
    const progressPercent =
      isThisDownloading && downloadProgress ? Math.round(downloadProgress.percent) : 0

    return (
      <div
        key={model.name}
        className={cn(
          'flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-colors',
          isActive
            ? 'border-primary/40 bg-primary/5'
            : 'border-border/40 bg-secondary/20'
        )}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-sm font-medium capitalize">{model.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{sizeLabel}</span>
            </div>
            {model.downloaded && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-500">
                Downloaded
              </span>
            )}
            {!model.downloaded && !isThisDownloading && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                Not Downloaded
              </span>
            )}
            {isActive && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/15 text-primary">
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {MODEL_DESCRIPTIONS[model.name]}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isThisDownloading && (
            <div className="flex items-center gap-2 min-w-[120px]">
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                {progressPercent}%
              </span>
            </div>
          )}

          {!isThisDownloading && model.downloaded && !isActive && (
            <Button
              variant="subtle"
              size="xs"
              onClick={() => handleSelect(model.name)}
            >
              <Check size={12} />
              Select
            </Button>
          )}

          {!isThisDownloading && !model.downloaded && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => handleDownload(model.name)}
              disabled={isDownloading}
            >
              <Download size={12} />
              Download
            </Button>
          )}

          {!isThisDownloading && model.downloaded && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <IconButton
                  variant="destructive"
                  size="sm"
                  disabled={isThisDeleting}
                >
                  {isThisDeleting ? (
                    <AppLoaderGlyph size={13} />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </IconButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{model.name}" model?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the downloaded model file from disk. You can re-download
                    it later if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => handleDelete(model.name)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    )
  })

  return (
    <SettingRow
      label="Voice Model"
      description="Select and manage Whisper speech recognition models. Larger models are more accurate but slower."
    >
      <div className="flex flex-col gap-2 min-w-[320px]">
        {loading ? loadingContent : modelList}
        {!loading && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              const modelsDir = models[0]?.path
              if (modelsDir) {
                const dir = modelsDir.substring(0, modelsDir.lastIndexOf('/'))
                navigator.clipboard.writeText(dir)
                toast.success('Models folder path copied to clipboard')
              }
            }}
            className="mt-1 self-start"
          >
            <FolderOpen size={12} />
            Copy models folder path
          </Button>
        )}
      </div>
    </SettingRow>
  )
})
