import { useState, useMemo, useEffect, useRef } from 'react'
import {
  ChevronDown, Download, Folder, Terminal, Braces, FileCode, FileCode2,
  Clipboard, X, Check, Sparkles, AlertCircle,
} from 'lucide-react'
import { readText } from '@tauri-apps/plugin-clipboard-manager'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { useApiClientStore } from '@/store/api-client-store'
import { IMPORT_FORMATS, detectImportFormat } from '../../utils/import-parsers'
import type { ImportFormat } from '../../utils/import-parsers'
import type { ApiCollection } from '../../APIClient.types'

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

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: ApiCollection[]
}

export function ImportDialog(props: ImportDialogProps): React.JSX.Element {
  const { open, onOpenChange, collections } = props
  const importRequest = useApiClientStore((s) => s.importRequest)
  const setActiveRequestId = useApiClientStore((s) => s.setActiveRequestId)
  const addCollection = useApiClientStore((s) => s.addCollection)

  const [input, setInput] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>('curl')
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
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
      setInput('')
      setSelectedCollectionId('')
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

  const handleImport = async () => {
    if (!input.trim() || importing) return

    setImporting(true)
    setError(null)
    try {
      let collectionId = selectedCollectionId
      if (!collectionId) {
        if (collections.length > 0) {
          collectionId = collections[0].id
        } else {
          const newCollection = await addCollection('Imported')
          collectionId = newCollection.id
        }
      }

      const imported = await importRequest(selectedFormat, input, collectionId)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleImport()
    }
  }

  const collectionItems: DropdownItem[] = useMemo(
    () => [
      {
        key: '',
        label: 'Auto (first collection)',
        icon: Folder,
        active: selectedCollectionId === '',
        onSelect: () => setSelectedCollectionId(''),
      },
      ...collections.map((c) => ({
        key: c.id,
        label: c.name,
        icon: Folder,
        active: c.id === selectedCollectionId,
        onSelect: () => setSelectedCollectionId(c.id),
      })),
    ],
    [collections, selectedCollectionId]
  )

  const selectedCollectionLabel = selectedCollectionId
    ? collections.find((c) => c.id === selectedCollectionId)?.name ?? 'Auto (first collection)'
    : 'Auto (first collection)'

  const charCount = input.length
  const lineCount = input ? input.split('\n').length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary">
              <Download size={15} />
            </span>
            Import Request
          </DialogTitle>
          <DialogDescription className="text-sm">
            Paste a request in any supported format to auto-fill method, URL, headers, and body.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-4 space-y-4">
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

          {/* Collection selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground shrink-0">Collection</label>
            <Dropdown
              items={collectionItems}
              openOn="click"
              align="left"
              showCheck
              menuWidth="280px"
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 h-8 px-2.5 text-xs rounded-md border border-border bg-background text-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <Folder size={13} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{selectedCollectionLabel}</span>
                  <ChevronDown size={12} className="opacity-50 shrink-0" />
                </button>
              }
            />
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
                onKeyDown={handleKeyDown}
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
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-muted/20">
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
              onClick={handleImport}
              disabled={!input.trim() || importing}
              className="gap-1.5"
            >
              <Download size={13} />
              {importing ? 'Importing…' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
