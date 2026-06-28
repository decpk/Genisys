export interface ManualConnectDialogData {
  open: boolean
  host: string
  port: string
  error: string | null
  isConnecting: boolean
  setHost: (value: string) => void
  setPort: (value: string) => void
  handleHostChange: (value: string) => void
  handleAddressPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  handleOpenChange: (open: boolean) => void
  handleConnect: () => void
}
