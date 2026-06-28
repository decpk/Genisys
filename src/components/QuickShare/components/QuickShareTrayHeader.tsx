import { useState } from 'react'
import { ChevronDown, Download, FileArchive, Smartphone, Trash2, Users } from 'lucide-react'

import type { QuickShareClient } from '@/components/QuickShare/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { notify } from '@/frameworks/notification'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useQuickShareStore } from '@/store/quickshare-store'

import { quickShareStyles as styles } from '../QuickShare.styles'

/** One entry per physical device — a device may hold several sockets/tabs. */
function dedupeByDevice(clients: QuickShareClient[]): QuickShareClient[] {
  const seen = new Set<string>()
  const out: QuickShareClient[] = []
  for (const c of clients) {
    if (!c.deviceId || seen.has(c.deviceId)) continue
    seen.add(c.deviceId)
    out.push(c)
  }
  return out
}

/**
 * Header of the right-hand "files" pane: the tray title + item count, plus the
 * bulk actions — "Download all" (gather every shared file into the QuickShare
 * folder), "Zip & send" (bundle everything into one archive addressed to a
 * device or everyone), and "Remove all" (clear the tray; saved files kept).
 */
export function QuickShareTrayHeader() {
  const items = useQuickShareStore((s) => s.items)
  const clients = useQuickShareStore((s) => s.clients)
  const downloadAll = useQuickShareStore((s) => s.downloadAll)
  const zipAndSend = useQuickShareStore((s) => s.zipAndSend)
  const removeAll = useQuickShareStore((s) => s.removeAll)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [downloading, setDownloading] = useState(false)
  const [zipping, setZipping] = useState(false)

  const fileCount = items.reduce((n, i) => (i.kind === 'file' ? n + 1 : n), 0)
  const devices = dedupeByDevice(clients)

  async function handleDownloadAll() {
    if (downloading) return
    setDownloading(true)
    try {
      const result = await downloadAll()
      if (!result) return
      const { copied, alreadySaved, dir } = result
      const total = copied + alreadySaved
      if (total === 0) {
        notify({ source: 'quickshare', type: 'info', message: 'No files to download.' })
        return
      }
      const message =
        copied > 0
          ? `Saved ${copied} file${copied === 1 ? '' : 's'} to the QuickShare folder.`
          : `All ${alreadySaved} file${alreadySaved === 1 ? '' : 's'} are already in the QuickShare folder.`
      notify({ source: 'quickshare', type: 'success', message })
      if (dir) {
        try {
          const { openPath } = await import('@tauri-apps/plugin-opener')
          await openPath(dir)
        } catch (err) {
          console.error('[quickshare] open folder failed', err)
        }
      }
    } finally {
      setDownloading(false)
    }
  }

  async function handleZipAndSend(target: string, label: string) {
    if (zipping) return
    setZipping(true)
    try {
      const result = await zipAndSend(target)
      if (!result) {
        notify({ source: 'quickshare', type: 'error', message: 'Could not create the zip.' })
        return
      }
      const { files } = result
      const where = target === 'everyone' ? 'everyone' : label
      notify({
        source: 'quickshare',
        type: 'success',
        message: `Zipped ${files} file${files === 1 ? '' : 's'} and sent to ${where}.`,
      })
    } finally {
      setZipping(false)
    }
  }

  function handleRemoveAll() {
    if (items.length === 0) return
    openConfirmDialog({
      title: 'Remove all shared items?',
      description:
        'This clears the shared tray and stops sharing everything. Files already saved to your QuickShare folder are kept on disk.',
      confirmLabel: 'Remove all',
      variant: 'destructive',
      onConfirm: async () => {
        const removed = await removeAll()
        notify({
          source: 'quickshare',
          type: 'info',
          message: `Removed ${removed} item${removed === 1 ? '' : 's'} from the tray.`,
        })
      },
    })
  }

  return (
    <div className={styles.rightHeader}>
      <div className={styles.rightHeaderTitle}>
        <span className={styles.trayTitle}>Shared tray</span>
        <span className={styles.trayCount}>
          {items.length} item{items.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className={styles.rightActions}>
        <Button
          variant="outline"
          size="xs"
          onClick={() => void handleDownloadAll()}
          disabled={fileCount === 0 || downloading}
        >
          <Download className="h-3.5 w-3.5" />
          Download all
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="xs" disabled={fileCount === 0 || zipping}>
              <FileArchive className="h-3.5 w-3.5" />
              Zip &amp; send
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Send a zip of all files to…</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => void handleZipAndSend('everyone', 'everyone')}>
              <Users className="h-3.5 w-3.5" />
              Everyone
            </DropdownMenuItem>
            {devices.map((d) => (
              <DropdownMenuItem
                key={d.deviceId}
                onSelect={() => void handleZipAndSend(d.deviceId, d.name || 'a device')}
              >
                <Smartphone className="h-3.5 w-3.5" />
                {d.name || 'Unnamed device'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleRemoveAll}
          disabled={items.length === 0}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove all
        </Button>
      </div>
    </div>
  )
}
