import { useState } from 'react'
import {
  Check,
  Copy,
  File,
  FileArchive,
  FileAudio,
  FileText,
  FileVideo,
  FolderOpen,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useQuickShareStore } from '@/store/quickshare-store'

import type { QuickShareTrayItem } from '../api'
import { quickShareStyles as styles } from '../QuickShare.styles'
import {
  formatBytes,
  formatRelativeTime,
  recipientLabel,
} from '../QuickShare.utils'

/**
 * The shared tray: every file + text snippet currently being shared. Files are
 * already on this machine (received items auto-save to Downloads/QuickShare,
 * desktop-shared items stay where they are), so the desktop view is a manage +
 * copy surface — remove an item to stop sharing it, or copy a text snippet.
 */
export function QuickShareTray() {
  const items = useQuickShareStore((s) => s.items)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        Nothing shared yet. Add a file or send some text, or have a device scan the
        QR code to drop something here.
      </div>
    )
  }

  const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className={styles.tray}>
      {sorted.map((item) => (
        <TrayRow key={item.id} item={item} />
      ))}
    </div>
  )
}

/** Static icon for a tray item — declared at module scope so it is not treated
 *  as a component created during render. */
function TrayThumb({ item }: { item: QuickShareTrayItem }) {
  const cls = 'h-5 w-5'
  if (item.kind === 'text') return <FileText className={cls} />
  const mime = item.mime
  if (mime.startsWith('image/')) return <ImageIcon className={cls} />
  if (mime.startsWith('video/')) return <FileVideo className={cls} />
  if (mime.startsWith('audio/')) return <FileAudio className={cls} />
  if (mime.includes('pdf')) return <FileText className={cls} />
  if (
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('tar') ||
    mime.includes('rar')
  ) {
    return <FileArchive className={cls} />
  }
  if (mime.startsWith('text/')) return <FileText className={cls} />
  return <File className={cls} />
}

function TrayRow({ item }: { item: QuickShareTrayItem }) {
  const removeItem = useQuickShareStore((s) => s.removeItem)
  const revealItem = useQuickShareStore((s) => s.revealItem)
  const clients = useQuickShareStore((s) => s.clients)
  const [copied, setCopied] = useState(false)

  function copyText() {
    if (!item.text || !navigator.clipboard) return
    void navigator.clipboard.writeText(item.text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const to = `→ ${recipientLabel(item.target, clients)}`
  const meta =
    item.kind === 'text'
      ? `${item.senderLabel} ${to} · ${formatRelativeTime(item.createdAt)}`
      : `${formatBytes(item.size)} · ${item.senderLabel} ${to} · ${formatRelativeTime(item.createdAt)}`

  return (
    <div className={styles.item}>
      <div className={styles.thumb}>
        <TrayThumb item={item} />
      </div>
      <div className={styles.itemBody}>
        {item.kind === 'text' ? null : (
          <span className={styles.itemName}>{item.name}</span>
        )}
        <span className={styles.itemMeta}>{meta}</span>
        {item.kind === 'text' && item.text ? (
          <div className={styles.itemText}>{item.text}</div>
        ) : null}
        <div className={styles.itemActions}>
          {item.kind === 'text' ? (
            <Button variant="ghost" size="xs" onClick={copyText}>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void revealItem(item.id)}
            >
              <FolderOpen className="h-3 w-3" />
              Open folder
            </Button>
          )}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => void removeItem(item.id)}
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
