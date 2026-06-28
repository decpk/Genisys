import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Ban, Keyboard, Pencil, Power, RotateCcw, Search } from 'lucide-react'

import {
  useKeyboardStore,
  useShortcutsWithConflicts,
  keyComboToDisplayString,
  eventToKeyString,
} from "@/frameworks/keyboard-shortcut";
import type { ResolvedShortcut, ShortcutScope } from '@/frameworks/keyboard-shortcut'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip } from "@/components/Tooltip";
import {
  KeyboardShortcutsTOC,
  SCOPE_ID_PREFIX,
  SCOPE_DATA_ATTR,
  CONFLICTS_ANCHOR_ID,
} from './KeyboardShortcutsTOC'

// ── Scope labels ─────────────────────────────────────────────────────

const SCOPE_LABELS: Record<string, string> = {
  global: 'Global',
  dashboard: 'Dashboard',
  explorer: 'Explorer',
  autoflow: 'Autoflow',
  webpoint: 'WebPoint',
  chat: 'Chat',
  library: 'Library',
  promptmanager: 'Prompt Manager',
  debug: 'Debug',
  settings: 'Settings',
}

// ── Key Badge ────────────────────────────────────────────────────────

const KeyBadge = memo(function KeyBadge({ keys, size = 'sm' }: { keys: string; size?: 'sm' | 'lg' }): React.JSX.Element {
  const symbols = keyComboToDisplayString(keys)
  const sizeClass = size === 'lg'
    ? 'min-w-[2rem] h-8 px-2.5 text-xs'
    : 'min-w-[1.5rem] h-6 px-1.5 text-[10px]'
  return (
    <span className="inline-flex items-center gap-1">
      {symbols.map((sym, i) => (
        <kbd
          key={i}
          className={`inline-flex items-center justify-center ${sizeClass} font-semibold rounded-[5px] border border-border/80 bg-gradient-to-b from-muted/80 to-muted/40 text-foreground shadow-[0_1px_0_1px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-150`}
        >
          {sym}
        </kbd>
      ))}
    </span>
  );
})

// ── Key Recorder Dialog ──────────────────────────────────────────────

function KeyRecorderDialog({
  shortcut,
  onSave,
  onClose,
}: {
  shortcut: ResolvedShortcut;
  onSave: (keys: string) => void;
  onClose: () => void;
}): React.JSX.Element {
  const [recordedCombos, setRecordedCombos] = useState<string[]>([]);
  const recorderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recorderRef.current?.focus();
  }, []);

  const recordedString =
    recordedCombos.length > 0 ? recordedCombos.join(" ") : null;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Commit shortcut: bare Enter (no modifiers) when something is recorded.
      if (
        e.key === "Enter" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        recordedCombos.length > 0
      ) {
        onSave(recordedCombos.join(" "));
        return;
      }

      // Cancel: bare Escape.
      if (
        e.key === "Escape" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        onClose();
        return;
      }

      // Clear last combo: bare Backspace.
      if (
        e.key === "Backspace" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        setRecordedCombos((prev) => prev.slice(0, -1));
        return;
      }

      const keyString = eventToKeyString(e.nativeEvent);
      if (!keyString) return;

      setRecordedCombos((prev) => {
        if (prev.length >= 2) return [keyString];
        return [...prev, keyString];
      });
    },
    [onClose, onSave, recordedCombos],
  );

  const displayKeys = recordedString ?? shortcut.keys;
  const canSave = recordedCombos.length > 0;
  const hintLabel =
    recordedCombos.length === 1
      ? "Press another key to make a chord, or "
      : "";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-base">{shortcut.label}</DialogTitle>
          {shortcut.description && (
            <DialogDescription>{shortcut.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Current shortcut */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium">
              {recordedString ? "New shortcut" : "Current shortcut"}
            </span>
            <div
              ref={recorderRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-transparent bg-muted/20 focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20 transition-all duration-200"
            >
              <KeyBadge keys={displayKeys} size="lg" />
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] text-muted-foreground/50 text-center leading-relaxed">
            Press any key combination to record a new shortcut.
            <br />
            {hintLabel}press{" "}
            <kbd className="px-1 py-0.5 rounded border border-border/60 bg-muted/30 text-[10px] mx-0.5">
              Enter
            </kbd>{" "}
            to save,{" "}
            <kbd className="px-1 py-0.5 rounded border border-border/60 bg-muted/30 text-[10px] mx-0.5">
              Backspace
            </kbd>{" "}
            to undo,{" "}
            <kbd className="px-1 py-0.5 rounded border border-border/60 bg-muted/30 text-[10px] mx-0.5">
              Esc
            </kbd>{" "}
            to cancel.
          </p>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="text-xs font-medium px-4 py-2 rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-150"
          >
            Cancel
          </button>
          <button
            onClick={() => canSave && onSave(recordedCombos.join(" "))}
            disabled={!canSave}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-all duration-150"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Shortcut Row ─────────────────────────────────────────────────────

const ShortcutRow = memo(function ShortcutRow({
  shortcut,
}: {
  shortcut: ResolvedShortcut
}): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const setOverride = useKeyboardStore((s) => s.setOverride)
  const removeOverride = useKeyboardStore((s) => s.removeOverride)
  const toggleShortcut = useKeyboardStore((s) => s.toggleShortcut)

  const hasConflicts = shortcut.conflicts.length > 0

  const handleSave = useCallback(
    (keys: string) => {
      setOverride(shortcut.id, keys)
      setIsEditing(false)
    },
    [shortcut.id, setOverride]
  )

  const handleReset = useCallback(() => {
    removeOverride(shortcut.id)
  }, [shortcut.id, removeOverride])

  const handleToggle = useCallback(() => {
    toggleShortcut(shortcut.id)
  }, [shortcut.id, toggleShortcut])

  return (
    <div
      className={`group/row flex items-center justify-between gap-3 py-2 px-3 transition-all duration-200 hover:bg-muted/30 ${shortcut.isDisabled ? "opacity-40" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-foreground tracking-[-0.01em]">
            {shortcut.label}
          </span>
          {shortcut.isOverridden && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/15">
              Modified
            </span>
          )}
          {hasConflicts && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1 border border-destructive/15">
              <AlertTriangle size={10} />
              Conflict
            </span>
          )}
        </div>
        {shortcut.description && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-snug">
            {shortcut.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <KeyBadge keys={shortcut.keys} />
        <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <Tooltip content="Edit shortcut" side="top">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-md hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
            >
              <Pencil size={13} />
            </button>
          </Tooltip>
          {shortcut.isOverridden && (
            <Tooltip content="Reset to default" side="top">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-md hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                <RotateCcw size={13} />
              </button>
            </Tooltip>
          )}
          <Tooltip
            content={shortcut.isDisabled ? "Enable shortcut" : "Disable shortcut"}
            side="top"
          >
            <button
              onClick={handleToggle}
              className={`p-1.5 rounded-md hover:bg-secondary/80 transition-colors duration-150 cursor-pointer ${
                shortcut.isDisabled
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {shortcut.isDisabled ? <Power size={13} /> : <Ban size={13} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {isEditing && (
        <KeyRecorderDialog
          shortcut={shortcut}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
})

// ── Section component ────────────────────────────────────────────────

export function KeyboardShortcutsSection(): React.JSX.Element {
  const [search, setSearch] = useState('')
  const resetAll = useKeyboardStore((s) => s.resetAll)
  const shortcuts = useShortcutsWithConflicts('global')

  // Group by scope
  const groups = useMemo(() => {
    const filtered = search
      ? shortcuts.filter(
          (s) =>
            s.label.toLowerCase().includes(search.toLowerCase()) ||
            s.keys.toLowerCase().includes(search.toLowerCase()) ||
            s.id.toLowerCase().includes(search.toLowerCase())
        )
      : shortcuts

    const map = new Map<ShortcutScope, ResolvedShortcut[]>()
    for (const shortcut of filtered) {
      const group = map.get(shortcut.scope)
      if (group) {
        group.push(shortcut)
      } else {
        map.set(shortcut.scope, [shortcut])
      }
    }

    // Sort: global first, then alphabetically
    const entries = Array.from(map.entries())
    entries.sort(([a], [b]) => {
      if (a === 'global') return -1
      if (b === 'global') return 1
      return a.localeCompare(b)
    })

    return entries
  }, [shortcuts, search])

  const conflictCount = useMemo(
    () => shortcuts.filter((s) => s.conflicts.length > 0).length,
    [shortcuts]
  )

  const overriddenCount = useMemo(
    () => shortcuts.filter((s) => s.isOverridden).length,
    [shortcuts]
  )

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0">
      {/* Header with inline search */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Keyboard Shortcuts</h1>
          <p className="text-sm text-muted-foreground mt-1.5">View and customize keyboard shortcuts for all apps.</p>
        </div>
        <div className="relative w-full sm:w-56 lg:w-64 shrink-0 sm:mt-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search shortcuts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-transparent bg-muted/20 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20 focus:bg-background transition-all duration-200"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted/40 text-muted-foreground font-medium">{shortcuts.length} shortcuts</span>
        {overriddenCount > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/15">{overriddenCount} modified</span>
        )}
        {conflictCount > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1 border border-destructive/15">
            <AlertTriangle size={11} />
            {conflictCount} conflicts
          </span>
        )}
        {overriddenCount > 0 && (
          <button
            onClick={resetAll}
            className="text-xs font-medium px-3 py-1 rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Conflict banner */}
      {conflictCount > 0 && (
        <div id={CONFLICTS_ANCHOR_ID} className="flex items-start gap-3 p-4 mb-6 rounded-xl border border-destructive/20 bg-destructive/5 scroll-mt-2">
          <div className="p-1.5 rounded-lg bg-destructive/10">
            <AlertTriangle size={14} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-destructive">
              {conflictCount} shortcut{conflictCount > 1 ? 's have' : ' has'} conflicting key bindings
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Conflicting shortcuts may not work as expected. Edit them to resolve the conflicts.
            </p>
          </div>
        </div>
      )}

      {/* Grouped shortcuts */}
      {groups.map(([scope, scopeShortcuts]) => (
        <div
          key={scope}
          id={`${SCOPE_ID_PREFIX}${scope}`}
          {...{ [SCOPE_DATA_ATTR]: scope }}
          className="mb-4 scroll-mt-2"
        >
          <div className="flex items-center gap-2 mb-1.5 px-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
              {SCOPE_LABELS[scope] ?? scope}
            </h3>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <div className="rounded-xl border border-border/30 bg-card/30 overflow-hidden">
            <div className="flex flex-col divide-y divide-border/20">
              {scopeShortcuts.map((shortcut) => (
                <ShortcutRow key={shortcut.id} shortcut={shortcut} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="p-3 rounded-2xl bg-muted/30">
            <Keyboard size={24} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground/60">No shortcuts found</p>
        </div>
      )}
      </div>
      <aside className="hidden lg:block w-56 shrink-0 pt-1 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <KeyboardShortcutsTOC
          groups={groups}
          scopeLabels={SCOPE_LABELS}
          showConflictsLink={conflictCount > 0}
        />
      </aside>
    </div>
  )
}
