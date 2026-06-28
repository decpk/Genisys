import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useSettingsStore } from '@/store/settings-store'
import { formatDate } from '@/components/DailyPlan/utils/formatDate'
import { DEFAULT_STATUS_TEMPLATE } from '../constants/defaultTemplate'
import { copyToClipboard } from '../utils/copyToClipboard'
import type { DailyStatusPanelData, DailyStatusPanelActions } from '../DailyStatusPanel.types'

const DEBOUNCE_MS = 900

interface UseDailyStatusPanelDataReturn {
  data: DailyStatusPanelData
  actions: DailyStatusPanelActions
}

export function useDailyStatusPanelData(): UseDailyStatusPanelDataReturn {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const dailyStatus = useDailyPlanStore((s) => s.dailyStatus)
  const saveDailyStatus = useDailyPlanStore((s) => s.saveDailyStatus)
  const dpStatusTemplate = useSettingsStore((s) => s.dpStatusTemplate)

  const fallbackTemplate = useMemo(
    () => dpStatusTemplate || DEFAULT_STATUS_TEMPLATE,
    [dpStatusTemplate],
  )

  const savedContent = dailyStatus[selectedDate]?.content
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Holds the not-yet-flushed save for the date the user is currently editing,
  // so a date switch can persist it to the correct date instead of losing it.
  const pendingSaveRef = useRef<(() => void) | null>(null)
  const [localContent, setLocalContent] = useState(savedContent ?? fallbackTemplate)
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
    setLocalContent(savedContent ?? fallbackTemplate)
  }

  // Pick up external updates to the persisted status for the current date
  // (e.g. AI tools writing the status) without clobbering in-flight edits.
  const lastSyncedContentRef = useRef(savedContent)
  if (lastSyncedContentRef.current !== savedContent) {
    lastSyncedContentRef.current = savedContent
    if (savedContent != null) {
      setLocalContent(savedContent)
    }
  }

  // When there is no saved status yet, reflect template edits live in the editor.
  const lastTemplateRef = useRef(fallbackTemplate)
  if (lastTemplateRef.current !== fallbackTemplate) {
    lastTemplateRef.current = fallbackTemplate
    if (savedContent == null) {
      setLocalContent(fallbackTemplate)
    }
  }

  useEffect(() => {
    return () => {
      flushPendingSave()
    }
  }, [flushPendingSave])

  const handleChange = useCallback(
    (markdown: string) => {
      setLocalContent(markdown)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Capture the date this edit belongs to so a later flush saves it
      // to the correct date even if the user has navigated away.
      const targetDate = selectedDate
      pendingSaveRef.current = () => {
        saveDailyStatus(targetDate, markdown)
      }

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        flushPendingSave()
      }, DEBOUNCE_MS)
    },
    [selectedDate, saveDailyStatus, flushPendingSave],
  )

  const handleCopy = useCallback(() => {
    const text = localContent || ''
    copyToClipboard(text).then((success) => {
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    })
  }, [localContent])

  const dateLabel = formatDate(selectedDate)

  return {
    data: { selectedDate, localContent, copied, dateLabel },
    actions: { handleChange, handleCopy },
  }
}
