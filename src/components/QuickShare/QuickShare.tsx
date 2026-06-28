import { Share2 } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import { useQuickShareStore } from '@/store/quickshare-store'

import {
  QuickShareComposer,
  QuickShareShareCard,
  QuickShareTray,
  QuickShareTrayHeader,
} from './components'
import { useQuickShareData } from './hooks/useQuickShareData'
import { quickShareStyles as styles } from './QuickShare.styles'

/**
 * QuickShare — a LAN "drop hub". Start sharing to show a QR code; any device on
 * the same Wi-Fi can scan it to send & receive files, photos, videos, and text
 * through a shared tray. The Rust backend runs the HTTP + WebSocket server;
 * this shell mirrors its tray + device list and lets the desktop participate.
 */
export function QuickShare() {
  useQuickShareData()

  const running = useQuickShareStore((s) => s.running)
  const busy = useQuickShareStore((s) => s.busy)
  const error = useQuickShareStore((s) => s.error)
  const clients = useQuickShareStore((s) => s.clients)
  const start = useQuickShareStore((s) => s.start)
  const stop = useQuickShareStore((s) => s.stop)

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Share2 className={styles.headerIcon} size={16} />
        <span className={styles.headerTitle}>QuickShare</span>
        <span className={styles.headerSpacer} />
        {running ? (
          <>
            <span className={styles.headerMeta}>
              {clients.length === 0
                ? 'No devices'
                : `${clients.length} connected`}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void stop()}
              disabled={busy}
            >
              Stop sharing
            </Button>
          </>
        ) : null}
      </header>

      {running ? (
        <div className={styles.body}>
          <div className={styles.panes}>
            <div className={styles.leftPane}>
              <QuickShareShareCard />
              <QuickShareComposer />
            </div>
            <div className={styles.rightPane}>
              <QuickShareTrayHeader />
              <div className={styles.rightScroll}>
                <QuickShareTray />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.scroll}>
          <div className={styles.content}>
            <div className={styles.startCta}>
              <div className={styles.startGlyph}>
                <Share2 size={28} />
              </div>
              <div className="flex flex-col gap-2">
                <div className={styles.startTitle}>
                  Share anything over the local network
                </div>
                <p className={styles.startIntro}>
                  Start QuickShare to get a QR code. Anyone on the same Wi-Fi can
                  scan it to send and receive files, photos, videos, and text — no
                  app or sign-in needed. Received files are saved to your
                  Downloads/QuickShare folder.
                </p>
              </div>
              {error ? <p className={styles.error}>{error}</p> : null}
              <Button onClick={() => void start()} disabled={busy}>
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
          </div>
        </div>
      )}
    </div>
  )
}
