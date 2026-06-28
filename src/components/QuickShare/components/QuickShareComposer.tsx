import { useState } from 'react'
import { ChevronDown, FilePlus2, SendHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import { notify } from '@/frameworks/notification'
import { useQuickShareStore } from '@/store/quickshare-store'

import { quickShareStyles as styles } from '../QuickShare.styles'
import { TARGET_EVERYONE, uniqueRecipients } from '../QuickShare.utils'

/**
 * Lets the desktop add content to the shared tray: pick local files (served in
 * place) or send a text snippet / link. When several devices are connected the
 * recipient picker chooses who receives it — everyone, or one specific device
 * (then only that device + this host can see/download it).
 */
export function QuickShareComposer() {
  const addFiles = useQuickShareStore((s) => s.addFiles)
  const addText = useQuickShareStore((s) => s.addText)
  const clients = useQuickShareStore((s) => s.clients)

  const [text, setText] = useState('')
  const [picking, setPicking] = useState(false)
  const [target, setTarget] = useState<string>(TARGET_EVERYONE)

  const recipients = uniqueRecipients(clients)
  // The chosen device may have disconnected — fall back to Everyone.
  const effectiveTarget =
    target !== TARGET_EVERYONE && !recipients.some((r) => r.deviceId === target)
      ? TARGET_EVERYONE
      : target

  async function pickFiles() {
    if (picking) return
    setPicking(true)
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({ multiple: true, title: 'Share files' })
      if (!selected) return
      const paths = Array.isArray(selected) ? selected : [selected]
      if (paths.length) {
        const added = await addFiles(paths, effectiveTarget)
        if (added > 0) {
          notify({
            source: 'quickshare',
            type: 'success',
            message: `Sharing ${added} file${added === 1 ? '' : 's'}.`,
          })
        }
      }
    } catch (err) {
      console.error('[quickshare] file pick failed', err)
    } finally {
      setPicking(false)
    }
  }

  async function send() {
    const trimmed = text.trim()
    if (!trimmed) return
    const ok = await addText(trimmed, effectiveTarget)
    if (ok) {
      setText('')
      notify({ source: 'quickshare', type: 'success', message: 'Text shared.' })
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void send()
    }
  }

  const recipientItems: DropdownItem[] = [
    {
      key: TARGET_EVERYONE,
      label: 'Everyone',
      active: effectiveTarget === TARGET_EVERYONE,
      onSelect: () => setTarget(TARGET_EVERYONE),
    },
    ...recipients.map((r) => ({
      key: r.deviceId,
      label: r.name,
      active: effectiveTarget === r.deviceId,
      onSelect: () => setTarget(r.deviceId),
    })),
  ]
  const selectedLabel =
    effectiveTarget === TARGET_EVERYONE
      ? 'Everyone'
      : (recipients.find((r) => r.deviceId === effectiveTarget)?.name ?? 'Everyone')

  return (
    <div className={styles.composer}>
      {recipients.length > 0 ? (
        <div className={styles.recipientRow}>
          <span className={styles.recipientLabel}>Send to</span>
          <div className="min-w-0 flex-1">
            <Dropdown
              openOn="click"
              fill
              align="left"
              side="bottom"
              menuWidth="trigger"
              showCheck
              items={recipientItems}
              trigger={
                <button type="button" className={styles.recipientTrigger}>
                  <span className="truncate">{selectedLabel}</span>
                  <ChevronDown
                    size={14}
                    className="shrink-0 text-muted-foreground"
                  />
                </button>
              }
            />
          </div>
        </div>
      ) : null}

      <Button
        variant="default"
        className="w-full"
        onClick={() => void pickFiles()}
        disabled={picking}
      >
        <FilePlus2 className="h-4 w-4" />
        Add files
      </Button>

      <div className={styles.composerLabel}>Or send text</div>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type or paste text / a link to share…"
        rows={2}
      />
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => void send()}
        disabled={!text.trim()}
      >
        <SendHorizontal className="h-4 w-4" />
        Send text
      </Button>
    </div>
  )
}
