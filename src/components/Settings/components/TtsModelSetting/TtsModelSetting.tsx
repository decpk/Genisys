import { memo, useState, useEffect, useCallback } from 'react'
import { Download, Trash2, Check, FolderOpen } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'
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
import { AppLoader } from '@/components/AppLoader'

interface TtsModel {
  variant: string
  size: number
  path: string
  downloaded: boolean
}

interface DownloadProgress {
  label: string
  downloadedBytes: number
  totalBytes: number
  percent: number
}

const MODEL_SIZE_LABELS: Record<string, string> = {
  'kokoro-en': '~350 MB',
}

const MODEL_DESCRIPTIONS: Record<string, string> = {
  'kokoro-en': 'Kokoro English TTS via sherpa-onnx. Natural-sounding neural speech with multiple voices.',
}

const MODEL_ORDER = ['kokoro-en']

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export const TtsModelSetting = memo(function TtsModelSetting(): React.JSX.Element {
  const ttsModel = useSettingsStore((s) => s.ttsModel)
  const setTtsModel = useSettingsStore((s) => s.setTtsModel)

  const [models, setModels] = useState<TtsModel[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [deletingModel, setDeletingModel] = useState<string | null>(null)

  const fetchModels = useCallback(async () => {
    try {
      const result = await window.api.ttsListModels()
      const sorted = [...result.models].sort(
        (a: TtsModel, b: TtsModel) => MODEL_ORDER.indexOf(a.variant) - MODEL_ORDER.indexOf(b.variant)
      )
      setModels(sorted)
    } catch {
      toast.error('Failed to load TTS models')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  useEffect(() => {
    const unsubProgress = window.api.onTtsModelDownloadProgress((data: DownloadProgress) => {
      setDownloadProgress(data)
    })

    const unsubDone = window.api.onTtsModelDownloadDone((data: { variant: string }) => {
      setDownloadingModel(null)
      setDownloadProgress(null)
      toast.success(`TTS model "${data.variant}" downloaded successfully`)
      fetchModels()
    })

    return () => {
      unsubProgress()
      unsubDone()
    }
  }, [fetchModels])

  const handleDownload = useCallback(
    async (variant: string) => {
      setDownloadingModel(variant)
      setDownloadProgress({ label: variant, downloadedBytes: 0, totalBytes: 0, percent: 0 })
      try {
        await window.api.ttsDownloadModel(variant)
      } catch (err) {
        setDownloadingModel(null)
        setDownloadProgress(null)
        toast.error(`Failed to download TTS model: ${err}`)
      }
    },
    []
  )

  const handleDelete = useCallback(
    async (variant: string) => {
      setDeletingModel(variant)
      try {
        await window.api.ttsDeleteModel(variant)
        toast.success(`TTS model "${variant}" deleted`)
        if (ttsModel === variant) {
          const remaining = models.filter((m) => m.downloaded && m.variant !== variant)
          if (remaining.length > 0) {
            setTtsModel(remaining[0].variant)
          }
        }
        await fetchModels()
      } catch {
        toast.error(`Failed to delete TTS model "${variant}"`)
      } finally {
        setDeletingModel(null)
      }
    },
    [ttsModel, models, setTtsModel, fetchModels]
  )

  const handleSelect = useCallback(
    (variant: string) => {
      setTtsModel(variant)
      toast.success(`TTS model set to "${variant}"`)
    },
    [setTtsModel]
  )

  const isDownloading = downloadingModel !== null

  const loadingContent = (
    <div className="py-6">
      <AppLoader size={16} text="Loading models…" fullScreen={false} className="py-2" />
    </div>
  )

  const modelList = models.map((model) => {
    const isActive = ttsModel === model.variant
    const isThisDownloading = downloadingModel === model.variant
    const isThisDeleting = deletingModel === model.variant
    const sizeLabel = model.downloaded
      ? formatFileSize(model.size)
      : (MODEL_SIZE_LABELS[model.variant] ?? 'Unknown')
    const progressPercent =
      isThisDownloading && downloadProgress ? Math.round(downloadProgress.percent) : 0

    return (
      <div
        key={model.variant}
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
              <span className="text-sm font-medium uppercase">{model.variant}</span>
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
            {MODEL_DESCRIPTIONS[model.variant]}
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
            <button
              onClick={() => handleSelect(model.variant)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Check size={12} />
              Select
            </button>
          )}

          {!isThisDownloading && !model.downloaded && (
            <button
              onClick={() => handleDownload(model.variant)}
              disabled={isDownloading}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={12} />
              Download
            </button>
          )}

          {!isThisDownloading && model.downloaded && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isThisDeleting}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isThisDeleting ? (
                    <AppLoaderGlyph size={13} />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{model.variant}" TTS model?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the downloaded model file from disk. You can re-download
                    it later if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => handleDelete(model.variant)}
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
      label="TTS Model"
      description="Select and manage Kokoro text-to-speech models. Smaller models are faster but slightly lower quality."
    >
      <div className="flex flex-col gap-2 min-w-[320px]">
        {loading ? loadingContent : modelList}
        {!loading && models.length > 0 && (
          <button
            onClick={() => {
              const modelsDir = models[0]?.path
              if (modelsDir) {
                const dir = modelsDir.substring(0, modelsDir.lastIndexOf('/'))
                navigator.clipboard.writeText(dir)
                toast.success('TTS models folder path copied to clipboard')
              }
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-1 self-start"
          >
            <FolderOpen size={12} />
            Copy models folder path
          </button>
        )}
      </div>
    </SettingRow>
  )
})
