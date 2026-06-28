import { Camera, Lock, Mic, ShieldCheck, Square, Video, Webcam } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { MonitorShareHost } from './components/MonitorShareHost'
import { useMonitorData } from './hooks/useMonitorData'
import { useMonitorSignaling } from './hooks/useMonitorSignaling'
import { monitorStyles as styles } from './Monitor.styles'

/**
 * Monitor — turns this device into a remote camera + microphone that a phone
 * or laptop on the same Wi-Fi can watch and listen to (scan a QR code, get
 * approved here, then view live over WebRTC). The desktop captures; the remote
 * watches and can pan, tilt &amp; zoom the view.
 */
export function Monitor() {
  // Live whenever the app is mounted so viewers are answered as they connect.
  useMonitorSignaling()

  const { running, busy, error, viewerCount, videoRef, start, stop, openPanel } =
    useMonitorData()

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.titleIcon}>
            <Webcam className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className={styles.title}>Monitor</div>
            <div className={styles.subtitle}>
              Stream this device's camera &amp; mic to a device on your Wi-Fi
            </div>
          </div>
        </div>

        {running ? (
          <div className={styles.headerActions}>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              {viewerCount} watching
            </span>
            <Button variant="outline" className={styles.shareBtn} onClick={openPanel}>
              <Video className="h-4 w-4" />
              Share
            </Button>
            <Button variant="destructive" onClick={stop} disabled={busy}>
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>
        ) : null}
      </header>

      <div className={styles.stage}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(styles.video, styles.videoMirror)}
        />

        {running ? (
          <div className={styles.liveTag}>
            <span className={styles.liveDot} />
            LIVE · {viewerCount} watching
          </div>
        ) : (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background">
            <div className={styles.idle}>
              <span className={styles.idleIcon}>
                <Webcam className="h-8 w-8" />
              </span>
              <div className={styles.idleTitle}>Camera &amp; microphone are off</div>
              <p className={styles.idleText}>
                Start streaming, then scan the QR code from a phone on the same
                Wi-Fi to watch and listen to your surroundings live. Every device
                must be approved here first.
              </p>

              {error ? <p className={styles.error}>{error}</p> : null}

              <Button
                className={styles.startButton}
                onClick={start}
                disabled={busy}
              >
                <Camera className="h-4 w-4" />
                {busy ? 'Starting…' : 'Start streaming'}
              </Button>

              <div className={styles.notes}>
                <div className={styles.note}>
                  <Camera className={styles.noteIcon} />
                  <span>
                    The camera and microphone only turn on while you are
                    streaming.
                  </span>
                </div>
                <div className={styles.note}>
                  <ShieldCheck className={styles.noteIcon} />
                  <span>Every device must be approved on this machine first.</span>
                </div>
                <div className={styles.note}>
                  <Mic className={styles.noteIcon} />
                  <span>
                    Viewers can watch, listen, and pan or zoom the view — nothing
                    else on this device.
                  </span>
                </div>
                <div className={styles.note}>
                  <Lock className={styles.noteIcon} />
                  <span>
                    Stays on your local network — only use on trusted Wi-Fi.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <MonitorShareHost />
    </div>
  )
}
