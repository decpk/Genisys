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
import { Switch } from '@/components/ui/switch'
import { useRemoteTerminalStore } from '@/store/remote-terminal-store'

import { QrCode } from './QrCode'
import { remoteShareStyles as styles } from './RemoteShare.styles'

/**
 * The "Share / Remote Access" panel. When stopped, shows a start CTA with the
 * security caveats; when running, shows the QR code + URL, connected devices,
 * and a stop control. Open state is driven by the remote-terminal store.
 */
export function RemoteSharePanel() {
  const panelOpen = useRemoteTerminalStore((s) => s.panelOpen)
  const closePanel = useRemoteTerminalStore((s) => s.closePanel)
  const running = useRemoteTerminalStore((s) => s.running)
  const url = useRemoteTerminalStore((s) => s.url)
  const busy = useRemoteTerminalStore((s) => s.busy)
  const error = useRemoteTerminalStore((s) => s.error)
  const clients = useRemoteTerminalStore((s) => s.clients)
  const start = useRemoteTerminalStore((s) => s.start)
  const stop = useRemoteTerminalStore((s) => s.stop)
  const disconnectClient = useRemoteTerminalStore((s) => s.disconnectClient)
  const permissions = useRemoteTerminalStore((s) => s.permissions)
  const setPermissions = useRemoteTerminalStore((s) => s.setPermissions)

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
            Anyone who scans must still be approved here. Traffic is unencrypted
            (HTTP) — only use on trusted networks.
          </span>
        </div>

        <div className={styles.perms}>
          <div className={styles.permsHeader}>Device permissions</div>
          <div className={styles.permRow}>
            <div className={styles.permText}>
              <span className={styles.permLabel}>Allow opening new tabs</span>
              <span className={styles.permSub}>
                Let connected devices start new shells.
              </span>
            </div>
            <Switch
              checked={permissions.allowNewTab}
              onCheckedChange={(checked) =>
                setPermissions({ ...permissions, allowNewTab: checked })
              }
              aria-label="Allow remote devices to open new tabs"
            />
          </div>
          <div className={styles.permRow}>
            <div className={styles.permText}>
              <span className={styles.permLabel}>Allow closing tabs</span>
              <span className={styles.permSub}>
                Let connected devices close (kill) tabs.
              </span>
            </div>
            <Switch
              checked={permissions.allowCloseTab}
              onCheckedChange={(checked) =>
                setPermissions({ ...permissions, allowCloseTab: checked })
              }
              aria-label="Allow remote devices to close tabs"
            />
          </div>
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
                  <Wifi className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <div className={styles.clientMeta}>
                    <div className={styles.clientIp}>{client.ip}</div>
                    <div className={styles.clientSub}>
                      Connected · {new Date(client.connectedAt).toLocaleTimeString()}
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
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            Sharing active
          </span>
          <Button variant="destructive" onClick={() => void stop()} disabled={busy}>
            Stop sharing
          </Button>
        </div>
      </div>
    )
  } else {
    body = (
      <div className={styles.startCta}>
        <p className={styles.intro}>
          Starts a small server on this machine so a phone or laptop on the same
          Wi-Fi can open and type into your terminal. Off by default — every device
          must be approved here before it gets access.
        </p>
        <div className={styles.warning}>
          <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
          <span>
            This grants full shell access to approved devices. Traffic is
            unencrypted (HTTP) — only use on trusted networks.
          </span>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <Button
          className={styles.startButton}
          onClick={() => void start()}
          disabled={busy}
        >
          {busy ? (
            <>
              <AppLoaderGlyph size={16} />
              Starting…
            </>
          ) : (
            'Start sharing'
          )}
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={panelOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remote Terminal Access</DialogTitle>
          <DialogDescription>
            Open this terminal in a browser on another device on the same network.
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}
