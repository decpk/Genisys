import { Dialog as DialogPrimitive } from 'radix-ui'
import { AlertCircle, Lock, Plus, Radio, X } from 'lucide-react'

import { manualConnectDialogStyles as s } from './ManualConnectDialog.styles'
import { useManualConnectDialogData } from './useManualConnectDialogData'

export function ManualConnectDialog(): React.JSX.Element {
  const {
    open,
    host,
    port,
    error,
    isConnecting,
    setPort,
    handleHostChange,
    handleAddressPaste,
    handleOpenChange,
    handleConnect,
  } = useManualConnectDialogData()

  let errorNode: React.JSX.Element | null = null
  if (error) {
    errorNode = (
      <p className={s.error}>
        <AlertCircle className="h-3.5 w-3.5" />
        {error}
      </p>
    )
  }

  const connectLabel = isConnecting ? 'Connecting…' : 'Connect'

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Trigger className={s.trigger}>
        <Plus className={s.triggerIcon} />
        Connect to a peer
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={s.overlay} />
        <DialogPrimitive.Content className={s.content}>
          <div className={s.header}>
            <span className={s.headerIconWrap}>
              <Radio className="h-5 w-5" />
            </span>
            <div>
              <DialogPrimitive.Title className={s.title}>
                Connect to a peer
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className={s.description}>
                Enter the host and port shared by the person you want to message.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className={s.closeButton} aria-label="Close">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className={s.form}>
            <div className={s.fieldRow}>
              <div className={`${s.field} ${s.fieldHost}`}>
                <label className={s.label} htmlFor="msg-connect-host">Host</label>
                <input
                  id="msg-connect-host"
                  className={s.input}
                  placeholder="192.168.1.42"
                  value={host}
                  autoFocus
                  onChange={(e) => handleHostChange(e.target.value)}
                  onPaste={handleAddressPaste}
                />
              </div>
              <div className={`${s.field} ${s.fieldPort}`}>
                <label className={s.label} htmlFor="msg-connect-port">Port</label>
                <input
                  id="msg-connect-port"
                  className={s.input}
                  placeholder="4040"
                  inputMode="numeric"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  onPaste={handleAddressPaste}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                />
              </div>
            </div>
            {errorNode}
            <p className={s.hint}>
              <Lock className="h-3 w-3" />
              The connection is end-to-end encrypted before the first message.
            </p>
          </div>

          <div className={s.footer}>
            <DialogPrimitive.Close className={s.cancel}>Cancel</DialogPrimitive.Close>
            <button
              type="button"
              className={s.connect}
              disabled={isConnecting}
              onClick={handleConnect}
            >
              <Radio className="h-4 w-4" />
              {connectLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
