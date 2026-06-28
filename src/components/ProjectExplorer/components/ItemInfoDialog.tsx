import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Info, Copy } from 'lucide-react'
import { AppInlineLoader } from '@/components/AppLoader'

import { copyToClipboard } from '@/lib/clipboard'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { getMimeCategory } from '../utils/getMimeCategory'
import type { RepoItem } from '../ProjectExplorer.types'

interface ItemInfoDialogProps {
  item: RepoItem
  rootPath?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface InfoEntry {
  label: string
  value: string
  isMono?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / Math.pow(1024, i)
  return `${i === 0 ? size : size.toFixed(1)} ${units[i]}`
}

function InfoRow({
  label,
  value,
  isMono,
  onCopy
}: InfoEntry & {
  onCopy: (label: string, e: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => onCopy(label, e)}
      className="flex items-center justify-between gap-4 rounded-md px-3 py-2 transition-colors hover:bg-secondary cursor-pointer group/row"
    >
      <span className="text-muted-foreground text-xs font-medium shrink-0 flex items-center gap-1">
        {label}
        <Copy size={10} className="opacity-0 group-hover/row:opacity-60 transition-opacity" />
      </span>
      <span className={`text-foreground text-sm text-right break-all ${isMono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </button>
  )
}

export function ItemInfoDialog({ item, rootPath, open: controlledOpen, onOpenChange }: ItemInfoDialogProps): React.JSX.Element {
  const name = item.path.split('/').pop() ?? item.path
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const dialogOpen = isControlled ? controlledOpen : internalOpen
  const setDialogOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const [diskInfo, setDiskInfo] = useState<{ loading: boolean; size?: string; fileCount?: number; folderCount?: number }>({ loading: false })
  const abortRef = useRef(false)

  useEffect(() => {
    if (!dialogOpen || !rootPath) {
      setDiskInfo({ loading: false })
      return
    }
    abortRef.current = false
    setDiskInfo({ loading: true })
    window.api.getDiskUsage(rootPath, item.path).then((result: any) => {
      if (abortRef.current) return
      if (result.success) {
        setDiskInfo({
          loading: false,
          size: result.formattedSize,
          fileCount: result.fileCount,
          folderCount: result.folderCount
        })
      } else {
        setDiskInfo({ loading: false })
      }
    })
    return () => {
      abortRef.current = true
    }
  }, [dialogOpen, rootPath, item.path])

  const entries = useMemo<InfoEntry[]>(() => {
    const all: InfoEntry[] = [
      { label: 'Name', value: name },
      { label: 'Type', value: item.isFolder ? 'Folder' : 'File' },
      { label: 'Path', value: item.path }
    ]
    if (!item.isFolder) {
      all.push({ label: 'Category', value: getMimeCategory(name) })
    }
    if (rootPath) {
      const cleanRoot = rootPath.replace(/\/+$/, '')
      const cleanPath = item.path.replace(/^\/+/, '')
      const fullPath = cleanPath ? `${cleanRoot}/${cleanPath}` : cleanRoot
      all.push({ label: 'Location', value: fullPath })
      const lastSlash = item.path.lastIndexOf('/')
      const parent = lastSlash > 0 ? item.path.slice(0, lastSlash) : '/'
      all.push({ label: 'Parent', value: parent })
    }
    if (item.objectId) all.push({ label: 'Object ID', value: item.objectId, isMono: true })
    if (item.gitObjectType) all.push({ label: 'Git Object Type', value: item.gitObjectType })
    if (item.commitId) all.push({ label: 'Commit ID', value: item.commitId, isMono: true })
    if (item.url) all.push({ label: 'URL', value: item.url, isMono: true })
    if (item.size !== undefined) all.push({ label: 'Size', value: formatBytes(item.size) })
    if (item.modifiedAt)
      all.push({ label: 'Modified', value: new Date(item.modifiedAt).toLocaleString() })
    if (item.mode) all.push({ label: 'Permissions', value: item.mode, isMono: true })
    if (rootPath && item.isFolder && diskInfo.folderCount !== undefined) {
      all.push({ label: 'Contains', value: `${diskInfo.folderCount} folders, ${diskInfo.fileCount} files` })
    }
    if (rootPath && diskInfo.size) {
      all.push({ label: 'Size on disk', value: diskInfo.size })
    }
    return all
  }, [name, item, rootPath, diskInfo])

  const handleCopy = useCallback(
    (label: string, e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const entry = entries.find((r) => r.label === label)
      copyToClipboard(entry?.value ?? '', label)
    },
    [entries]
  )

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 ml-auto p-1 rounded transition-opacity hover:bg-secondary cursor-pointer"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            aria-label={`Info for ${name}`}
          >
            <Info size={14} className="text-muted-foreground" />
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col divide-y divide-border/30">
          {entries.map((entry) => (
            <InfoRow key={entry.label} {...entry} onCopy={handleCopy} />
          ))}
          {rootPath && diskInfo.loading && (
            <div className="flex items-center gap-2 px-3 py-2">
              <AppInlineLoader message="Loading disk info…" size={12} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
