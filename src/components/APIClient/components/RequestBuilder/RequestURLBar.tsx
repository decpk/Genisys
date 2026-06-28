import { useMemo } from 'react'
import { Send, ChevronDown, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { EnvironmentSelector } from '../EnvironmentSelector/EnvironmentSelector'
import { METHOD_PILL_COLORS, METHOD_DOT_COLORS, HTTP_METHODS } from '../../APIClient.constants'
import type { HttpMethod } from '../../APIClient.types'
import { detectImportFormat } from '../../utils/import-parsers'

interface RequestURLBarProps {
  method: HttpMethod
  url: string
  isSending: boolean
  onMethodChange: (method: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSend: () => void
  onCancel: () => void
  onImportText?: (text: string) => Promise<boolean>
}

export function RequestURLBar(props: RequestURLBarProps): React.JSX.Element {
  const { method, url, isSending, onMethodChange, onUrlChange, onSend, onCancel, onImportText } = props

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSending) onSend()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!onImportText) return
    const text = e.clipboardData.getData('text')
    if (!text.trim()) return
    if (!detectImportFormat(text)) return
    e.preventDefault()
    void onImportText(text)
  }

  const methodItems: DropdownItem[] = useMemo(
    () =>
      HTTP_METHODS.map((m) => ({
        key: m,
        label: m,
        active: m === method,
        prefix: <span className={`inline-block size-2 rounded-full ${METHOD_DOT_COLORS[m]}`} />,
        onSelect: () => onMethodChange(m),
      })),
    [method, onMethodChange]
  )

  return (
    <div className="px-3 pt-3 pb-1">
      <div className="flex items-center gap-2 rounded-xl border border-transparent bg-card shadow-xs px-1.5 py-1.5 transition-shadow focus-within:shadow-sm focus-within:border-input focus-within:ring-1 focus-within:ring-ring/20">
        {/* Method pill */}
        <Dropdown
          items={methodItems}
          openOn="click"
          align="left"
          showCheck
          menuWidth="140px"
          trigger={
            <button
              className={`flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg cursor-pointer transition-all ${METHOD_PILL_COLORS[method]}`}
            >
              {method}
              <ChevronDown size={11} className="opacity-50" />
            </button>
          }
        />

        {/* URL input */}
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Enter request URL..."
          className="flex-1 h-8 text-xs font-sans bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
          spellCheck={false}
        />

        {/* Environment selector */}
        <EnvironmentSelector />

        {/* Send / Stop button */}
        {isSending ? (
          <Tooltip content="Cancel Request" side="bottom">
            <Button
              onClick={onCancel}
              variant="destructive"
              className="rounded-lg px-4 gap-1.5 h-8 text-xs font-semibold transition-all active:scale-[0.97]"
            >
              <Square size={11} className="fill-current" />
              Stop
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content="Send Request (⌘ Enter)" side="bottom">
            <Button
              onClick={onSend}
              disabled={!url.trim()}
              className="rounded-lg px-4 gap-1.5 h-8 text-xs font-semibold transition-all active:scale-[0.97] disabled:opacity-40"
            >
              <Send size={13} />
              Send
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
