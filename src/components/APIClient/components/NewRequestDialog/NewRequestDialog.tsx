import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Terminal, Braces, FileCode, FileCode2,
  Clipboard, X, Check, Sparkles, AlertCircle, Download,
} from 'lucide-react'
import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useApiClientStore } from '@/store/api-client-store'
import { HTTP_METHODS, METHOD_COLORS } from '../../APIClient.constants'
import { IMPORT_FORMATS, detectImportFormat } from '../../utils/import-parsers'
import type { ImportFormat } from '../../utils/import-parsers'
import type { HttpMethod } from '../../APIClient.types'

type DialogMode = 'new' | 'import'

// ─── Per-format visual metadata ──────────────────────────────────
type FormatMeta = {
  icon: React.ComponentType<{ size?: number; className?: string }>
  activeClass: string
  iconClass: string
}

const FORMAT_META: Record<ImportFormat, FormatMeta> = {
  'curl':             { icon: Terminal,  activeClass: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400', iconClass: 'text-emerald-400' },
  'raw-http':         { icon: FileCode,  activeClass: 'border-blue-400/25 bg-blue-400/10 text-blue-400',          iconClass: 'text-blue-400' },
  'fetch':            { icon: Braces,    activeClass: 'border-amber-400/25 bg-amber-400/10 text-amber-400',       iconClass: 'text-amber-400' },
  'axios':            { icon: Braces,    activeClass: 'border-purple-400/25 bg-purple-400/10 text-purple-400',    iconClass: 'text-purple-400' },
  'httpie':           { icon: Terminal,  activeClass: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-400',          iconClass: 'text-cyan-400' },
  'powershell':       { icon: Terminal,  activeClass: 'border-blue-400/25 bg-blue-400/10 text-blue-400',          iconClass: 'text-blue-400' },
  'python-requests':  { icon: FileCode2, activeClass: 'border-orange-400/25 bg-orange-400/10 text-orange-400',    iconClass: 'text-orange-400' },
  'wget':             { icon: Terminal,  activeClass: 'border-red-400/25 bg-red-400/10 text-red-400',             iconClass: 'text-red-400' },
}

interface NewRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string | null
  folderId?: string
}

export function NewRequestDialog(props: NewRequestDialogProps): React.JSX.Element {
  const { open, onOpenChange, collectionId, folderId } = props
  const addRequest = useApiClientStore((s) => s.addRequest)
  const importRequest = useApiClientStore((s) => s.importRequest)
  const setActiveRequestId = useApiClientStore((s) => s.setActiveRequestId)

  // ── Shared state ──
  const [mode, setMode] = useState<DialogMode>('new')

  // ── New request state ──
  const [name, setName] = useState('')
  const [method, setMethod] = useState<HttpMethod>('GET')

  // ── Import state ──
  const [input, setInput] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>('curl')
  const [userPickedFormat, setUserPickedFormat] = useState(false)
  const [autoDetected, setAutoDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentFormat = useMemo(
    () => IMPORT_FORMATS.find((f) => f.key === selectedFormat)!,
    [selectedFormat]
  )

  useEffect(() => {
    if (!open) {
      setMode('new')
      setName('')
      setMethod('GET')
      setInput('')
      setSelectedFormat('curl')
      setUserPickedFormat(false)
      setAutoDetected(false)
      setError(null)
      setImporting(false)
    }
  }, [open])

  useEffect(() => {
    if (error) setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  // ── New request handlers ──
  const handleCreateSubmit = async () => {
    if (!name.trim() || !collectionId) return
    const req = await addRequest(collectionId, name.trim(), method, folderId)
    setActiveRequestId(req.id)
    setName('')
    setMethod('GET')
    onOpenChange(false)
  }

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateSubmit()
  }

  // ── Import handlers ──
  const handlePickFormat = (key: ImportFormat) => {
    setSelectedFormat(key)
    setUserPickedFormat(true)
    setAutoDetected(false)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (userPickedFormat) return
    const pasted = e.clipboardData.getData('text')
    if (!pasted.trim()) return
    const detected = detectImportFormat(pasted)
    if (detected && detected !== selectedFormat) {
      setSelectedFormat(detected)
      setAutoDetected(true)
    }
  }

  const handlePasteButton = async () => {
    try {
      const text = await readText()
      if (!text) return
      setInput(text)
      if (!userPickedFormat) {
        const detected = detectImportFormat(text)
        if (detected && detected !== selectedFormat) {
          setSelectedFormat(detected)
          setAutoDetected(true)
        }
      }
      textareaRef.current?.focus()
    } catch {
      // Clipboard access denied — silently ignore.
    }
  }

  const handleClear = () => {
    setInput('')
    textareaRef.current?.focus()
  }

  const handleImportSubmit = async () => {
    if (!input.trim() || importing || !collectionId) return
    setImporting(true)
    setError(null)
    try {
      const imported = await importRequest(selectedFormat, input, collectionId, folderId)
      setActiveRequestId(imported.id)
      onOpenChange(false)
    } catch (err) {
      console.error('[api-client] Import failed:', err)
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to import request. Check your input.'
      setError(message)
      setImporting(false)
    }
  }

  const handleImportKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleImportSubmit()
    }
  }

  const charCount = input.length
  const lineCount = input ? input.split('\n').length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] sm:h-[560px] p-0 overflow-hidden gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-0 shrink-0">
          <DialogTitle>New Request</DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="px-6 py-3 shrink-0">
          <div className="flex gap-1 bg-foreground/[0.07] border border-border/50 p-0.5 rounded-md shadow-sm w-fit">
            <button
              onClick={() => setMode('new')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                mode === 'new'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setMode('import')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                mode === 'import'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Import
            </button>
          </div>
        </div>

        {mode === 'new' ? (
          <>
            <div className="space-y-4 py-2 px-6 flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleCreateKeyDown}
                  placeholder="Get Users"
                  className="h-8 text-xs"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Method</label>
                <div className="flex flex-wrap gap-1.5">
                  {HTTP_METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${
                        method === m
                          ? `${METHOD_COLORS[m]} border-current bg-current/10`
                          : 'text-muted-foreground border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 mt-auto shrink-0">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateSubmit} disabled={!name.trim()}>
                Create
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="px-6 pb-4 space-y-4 flex-1 overflow-y-auto">
              {/* Format picker grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between h-4">
                  <label className="text-xs font-medium text-muted-foreground">Format</label>
                  {autoDetected && !userPickedFormat && (
                    <span className="inline-flex items-center gap-1 text-2xs text-primary/80">
                      <Sparkles size={10} />
                      Auto-detected {currentFormat.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {IMPORT_FORMATS.map((f) => {
                    const meta = FORMAT_META[f.key]
                    const Icon = meta.icon
                    const isActive = f.key === selectedFormat
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => handlePickFormat(f.key)}
                        className={[
                          'relative flex flex-col items-center justify-center gap-1.5 h-16 px-2 rounded-md border text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:bg-primary/5',
                          isActive
                            ? meta.activeClass + ' shadow-sm'
                            : 'border-border bg-background text-foreground hover:bg-muted/50',
                        ].join(' ')}
                        title={f.label}
                      >
                        <Icon
                          size={16}
                          className={isActive ? '' : meta.iconClass + ' opacity-80'}
                        />
                        <span className="truncate max-w-full leading-none">{f.label}</span>
                        {isActive && (
                          <span className="absolute top-1 right-1 inline-flex items-center justify-center size-3.5 rounded-full bg-current/20">
                            <Check size={9} className="stroke-[3]" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Code input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    {currentFormat.label}
                  </label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handlePasteButton}
                      className="h-6 px-2 text-xs gap-1"
                    >
                      <Clipboard size={11} />
                      Paste
                    </Button>
                    {input && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-6 px-2 text-xs gap-1 text-muted-foreground"
                      >
                        <X size={11} />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleImportKeyDown}
                    placeholder={currentFormat.placeholder}
                    spellCheck={false}
                    className="w-full h-48 p-3 text-xs font-sans rounded-md border border-input bg-muted/30 dark:bg-card text-foreground resize-none outline-none select-text placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 transition-[color,box-shadow]"
                  />
                  {input && (
                    <div className="absolute bottom-2 right-3 text-2xs text-muted-foreground/70 pointer-events-none select-none bg-muted/40 backdrop-blur-sm rounded px-1.5 py-0.5">
                      {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {charCount} chars
                    </div>
                  )}
                </div>
              </div>

              {/* Inline error */}
              {error && (
                <div className="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-muted/20 shrink-0">
              <span className="text-2xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded border border-border bg-background text-2xs font-sans">
                  ⌘
                </kbd>
                <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded border border-border bg-background text-2xs font-sans">
                  ↵
                </kbd>
                to import
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleImportSubmit}
                  disabled={!input.trim() || importing}
                  className="gap-1.5"
                >
                  <Download size={13} />
                  {importing ? 'Importing…' : 'Import'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
