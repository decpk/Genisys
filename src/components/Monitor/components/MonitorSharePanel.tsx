import { useState } from 'react'
import { Check, Copy, ShieldAlert, Wifi } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useMonitorStore } from '@/store/monitor-store'

import { startMonitorSession, stopMonitorSession } from '../engine/monitorSession'
import { QrCode } from './QrCode'
import { monitorStyles as styles } from '../Monitor.styles'

/**
 * The Monitor "Share" panel. When running, shows the QR code + URL and the
 * connected devices with a Stop control; when stopped, shows a start CTA with
 * the privacy caveats. Open state is driven by the monitor store.
 */
export function MonitorSharePanel() {
  const panelOpen = useMonitorStore((s) => s.panelOpen)
  const closePanel = useMonitorStore((s) => s.closePanel)
  const running = useMonitorStore((s) => s.running)
  const url = useMonitorStore((s) => s.url)
  const busy = useMonitorStore((s) => s.busy)
  const error = useMonitorStore((s) => s.error)
  const clients = useMonitorStore((s) => s.clients)
  const disconnectClient = useMonitorStore((s) => s.disconnectClient)

  const [copied, setCopied] = useState(false)

  function copyUrl() {
    if (!url || !navigator.clipboard) return
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  function handleOpenChange(open: boolean) {
    if (!open) closePanel()
  }

  let body: React.ReactNode
  if (running && url) {
    body = (
      <div className={styles.body}>
        <div className={styles.qrWrap}>
          <QrCode value={url} size={216} className={styles.qr} />
          <p className={styles.qrCaption}>
            Scan with a device on the same Wi-Fi, then approve it here.
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

        <div className={styles.warning}>
          <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
          <span>
            Anyone who scans must still be approved here. The feed shows your
            camera and microphone. Traffic is unencrypted (HTTP) — only use on
            trusted networks.
          </span>
        </div>

        <div>
          <div className={styles.clientsHeader}>
            <span>Connected devices</span>
            <span>{clients.length}</span>
          </div>
          {clients.length === 0 ? (
            <div className={styles.clientsEmpty}>No devices connected yet.</div>
          ) : (
            <div className={styles.clientList}>
              {clients.map((client) => (
                <div key={client.clientId} className={styles.clientRow}>
                  <Wifi className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <div className={styles.clientMeta}>
                    <div className={styles.clientIp}>{client.ip}</div>
                    <div className={styles.clientSub}>
                      Watching · {new Date(client.connectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.disconnectBtn}
                    onClick={() => disconnectClient(client.clientId)}
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.panelLiveBadge}>
            <span className={styles.panelLiveDot} />
            Streaming live
          </span>
          <Button
            variant="destructive"
            onClick={() => void stopMonitorSession()}
            disabled={busy}
          >
            Stop streaming
          </Button>
        </div>
      </div>
    )
  } else {
    body = (
      <div className={styles.startCta}>
        <p className={styles.intro}>
          Turns on this device's camera and microphone and serves a live view to a
          phone or laptop on the same Wi-Fi. Off by default — every device must be
          approved here before it can watch.
        </p>
        <div className={styles.warning}>
          <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
          <span>
            Approved devices can see and hear your surroundings. Traffic is
            unencrypted (HTTP) — only use on trusted networks.
          </span>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button
          className={styles.startButton}
          onClick={() => void startMonitorSession()}
          disabled={busy}
        >
          {busy ? (
            <>
              <AppLoaderGlyph size={16} />
              Starting…
            </>
          ) : (
            'Start streaming'
          )}
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={panelOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share live camera & mic</DialogTitle>
          <DialogDescription>
            Watch and listen to this device from a browser on another device on
            the same network.
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}
