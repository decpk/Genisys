import { Dialog as DialogPrimitive } from 'radix-ui'
import { BookOpen, NotebookPen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useContentShareStore } from '@/store/content-share-store'

/**
 * Global receiver-side approval prompt. Shows the head of the incoming-offer
 * queue and resolves it with the user's Accept / Decline. Mounted once at the
 * app root via `ContentShareProvider`.
 */
export function IncomingShareDialog() {
  const incoming = useContentShareStore((s) => s.incoming)
  const respond = useContentShareStore((s) => s.respond)

  const current = incoming[0] ?? null
  if (!current) return null

  const { manifest, senderDeviceName, transferId } = current
  const Icon = manifest.kind === 'library' ? BookOpen : NotebookPen
  const kindLabel = manifest.kind === 'library' ? 'a book' : 'notes'

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) void respond(transferId, false)
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon size={18} /> Incoming share
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{senderDeviceName}</span> wants to send
            you {kindLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="truncate font-medium">{manifest.title}</div>
          <div className="text-xs text-muted-foreground">{manifest.summary}</div>
        </div>

        <DialogFooter>
          <DialogPrimitive.Close asChild>
            <Button variant="outline" onClick={() => void respond(transferId, false)}>
              Decline
            </Button>
          </DialogPrimitive.Close>
          <Button onClick={() => void respond(transferId, true)}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
