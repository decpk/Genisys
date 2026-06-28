import { useState } from 'react'
import { Check, Copy, FolderOpen, ShieldAlert, Wifi } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useQuickShareStore } from '@/store/quickshare-store'

import { quickShareStyles as styles } from '../QuickShare.styles'
import { QrCode } from './QrCode'

/**
 * The "share" card shown while QuickShare is running: the QR code + address to
 * scan, the auto-save folder, a security caveat, and a live device count.
 */
export function QuickShareShareCard() {
  const url = useQuickShareStore((s) => s.url)
  const storageDir = useQuickShareStore((s) => s.storageDir)
  const clients = useQuickShareStore((s) => s.clients)

  const [copied, setCopied] = useState(false)

  if (!url) return null

  function copyUrl() {
    if (!url || !navigator.clipboard) return
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  async function openFolder() {
    if (!storageDir) return
    try {
      const { openPath } = await import('@tauri-apps/plugin-opener')
      await openPath(storageDir)
    } catch (err) {
      console.error('[quickshare] open folder failed', err)
    }
  }

  const deviceCount = clients.length

  return (
    <div className={styles.card}>
      <div className={styles.qrWrap}>
        <QrCode value={url} size={208} className={styles.qr} />
        <p className={styles.qrCaption}>
          Scan with any phone or computer on the same Wi-Fi to send &amp; receive
          files, photos, videos, and text.
        </p>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Address</span>
        <div className={styles.fieldRow}>
          <span className={styles.fieldValue}>{url}</span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={copyUrl}
            aria-label="Copy address"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {storageDir ? (
        <div className={styles.folderRow}>
          <div className={styles.folderText}>
            <span className={styles.folderLabel}>Saving received files to</span>
            <span className={styles.folderPath}>{storageDir}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => void openFolder()}>
            <FolderOpen className="h-3.5 w-3.5" />
            Open
          </Button>
        </div>
      ) : null}

      <div className={styles.warning}>
        <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
        <span>
          Anyone on this Wi-Fi who scans the code can send and download files.
          Traffic is unencrypted (HTTP) — only use on trusted networks.
        </span>
      </div>

      <div
        className={
          deviceCount === 0 ? styles.clientsRowIdle : styles.clientsRow
        }
      >
        {deviceCount === 0 ? (
          <Wifi className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <span className={styles.liveDotWrap}>
            <span className={styles.liveDotPing} />
            <span className={styles.liveDot} />
          </span>
        )}
        {deviceCount === 0
          ? 'No devices connected yet'
          : `${deviceCount} device${deviceCount > 1 ? 's' : ''} connected`}
      </div>
    </div>
  )
}
