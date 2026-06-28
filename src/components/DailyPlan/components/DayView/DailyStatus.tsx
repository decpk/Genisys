import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { Tooltip } from '@/components/Tooltip'
import { WysiwygEditor } from '@/frameworks/wysiwyg-editor'
import { generateId } from '../../utils/generateId'

const DEFAULT_TEMPLATE = `## 📊 Status Update

**Focus Area:**  
**Overall Progress:** (e.g., On track / At risk / Delayed)

---

## ✅ Yesterday (Key Outcomes)

- What actually moved forward:
- What got completed (reference IDs if needed):
- Any meaningful result (not just activity):

---

## 🚀 Today (Focus, not task list)

- Primary focus:
- Secondary focus:
- What success looks like by end of day:

---

## ⚠️ Blockers / Risks

- Issue:
  - Why it matters:
  - What’s needed to unblock:

---

## 🔄 Progress Snapshot

- Current momentum: (e.g., Fast / Normal / Slow)
- Confidence level: (High / Medium / Low)
- Any deviation from plan:

---

## 🧠 Key Updates / Decisions

- Important decisions:
- Changes in approach:
- Learnings:

---

## 🔮 Upcoming (Short-term outlook)

- What’s coming next:
- Any dependency to watch:`;

export function DailyStatus(): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const dailyEntries = useDailyPlanStore((s) => s.dailyEntries)
  const saveDailyEntry = useDailyPlanStore((s) => s.saveDailyEntry)

  const entry = dailyEntries[selectedDate]
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Holds the not-yet-flushed save for the date the user is currently editing,
  // so a date switch can persist it to the correct date instead of losing it.
  const pendingSaveRef = useRef<(() => void) | null>(null)
  const [localContent, setLocalContent] = useState(entry?.statusContent ?? DEFAULT_TEMPLATE)
  const [copied, setCopied] = useState(false)

  const flushPendingSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (pendingSaveRef.current) {
      const save = pendingSaveRef.current
      pendingSaveRef.current = null
      save()
    }
  }, [])

  // Reset content synchronously when the date changes. The editor is keyed by
  // `selectedDate` and remounts in the same render, so resetting here (instead
  // of in a post-commit effect) prevents the new date's editor from briefly
  // mounting with — and persisting — the previous date's content.
  const lastDateRef = useRef(selectedDate)
  if (lastDateRef.current !== selectedDate) {
    flushPendingSave()
    lastDateRef.current = selectedDate
    setLocalContent(entry?.statusContent ?? DEFAULT_TEMPLATE)
  }

  // Pick up external updates to the persisted entry for the current date
  // (e.g. AI tools writing the status) without clobbering in-flight edits.
  const lastSyncedContentRef = useRef(entry?.statusContent)
  if (lastSyncedContentRef.current !== entry?.statusContent) {
    lastSyncedContentRef.current = entry?.statusContent
    if (entry?.statusContent != null) {
      setLocalContent(entry.statusContent)
    }
  }

  const handleChange = useCallback(
    (markdown: string) => {
      setLocalContent(markdown)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Capture the date/entry this edit belongs to so a later flush saves it
      // to the correct date even if the user has navigated away.
      const targetEntry = entry
      const targetDate = selectedDate
      pendingSaveRef.current = () => {
        const now = new Date().toISOString()
        const updated = targetEntry
          ? { ...targetEntry, statusContent: markdown, updatedAt: now }
          : {
              id: generateId('entry'),
              date: targetDate,
              motivationalQuote: '',
              statusContent: markdown,
              yesterdayReview: '',
              createdAt: now,
              updatedAt: now,
            }
        saveDailyEntry(updated)
      }

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        flushPendingSave()
      }, 900)
    },
    [entry, selectedDate, saveDailyEntry, flushPendingSave]
  )

  useEffect(() => {
    return () => {
      flushPendingSave()
    }
  }, [flushPendingSave])

  function handleShare() {
    const text = localContent || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left group"
      >
        <div className="flex items-center justify-center size-5 rounded-md bg-purple-500/10 shrink-0">
          <FileText className="size-3 text-purple-500" />
        </div>
        <h3 className="text-xs font-semibold text-foreground flex-1">
          Daily Status
        </h3>
        <Tooltip content="Copy to clipboard">
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            role="button"
            tabIndex={0}
          >
            {copied ? (
              <Check className="size-3 text-green-500" />
            ) : (
              <Copy className="size-3" />
            )}
          </span>
        </Tooltip>
        <span className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          {isCollapsed ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronUp className="size-3.5" />
          )}
        </span>
      </button>

      {/* Editor area */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="rounded-lg bg-muted/20 border border-border/20 min-h-[260px] max-h-[360px] flex flex-col overflow-y-auto">
            <div className="p-0 daily-status-editor flex flex-col flex-1">
              <WysiwygEditor
                key={selectedDate}
                value={localContent}
                onChange={handleChange}
                placeholder="Write your daily standup status..."
                style={{
                  padding: "1px",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
