import { useCallback, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('mock-server')

import { useMockServerStore } from '@/store/mock-server-store'

interface UseRequestLogExportButtonData {
  isExporting: boolean
  isDisabled: boolean
  handleExport: () => Promise<void>
}

function countEntries(json: string): number {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

export function useRequestLogExportButtonData(): UseRequestLogExportButtonData {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const exportRequestLogs = useMockServerStore((s) => s.exportRequestLogs)

  const [isExporting, setIsExporting] = useState(false)

  const isDisabled = selectedServerId === null || isExporting

  const handleExport = useCallback(async () => {
    if (selectedServerId === null) return
    setIsExporting(true)
    try {
      const json = await exportRequestLogs(selectedServerId)
      const count = countEntries(json)
      await navigator.clipboard.writeText(json)
      toast.success(`Exported ${count} request log${count === 1 ? '' : 's'} to clipboard`, {
        duration: 2500,
      })
    } catch (err) {
      toast.error(`Failed to export request logs: ${String(err)}`)
    } finally {
      setIsExporting(false)
    }
  }, [selectedServerId, exportRequestLogs])

  return { isExporting, isDisabled, handleExport }
}
