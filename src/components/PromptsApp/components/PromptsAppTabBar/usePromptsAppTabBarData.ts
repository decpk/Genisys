import { useCallback, useMemo } from 'react'

import { usePromptManagerStore, type PmPrompt } from '@/store/prompt-manager-store'
import { usePromptsAppTabsStore } from '@/store/prompts-app-tabs-store'

import type { PromptsAppData } from '../../PromptsApp.types'
import type { PromptsAppTabBarData } from './PromptsAppTabBar.types'

/**
 * Bridges the tabs store, the prompt-manager store and the orchestrator
 * `usePromptsAppData` hook to give the tab bar everything it needs in
 * one selector-friendly shape.
 *
 * The hook intentionally consumes `data` as a parameter (not via the
 * hook itself) so we honour the "one orchestrator hook per app" rule
 * laid out in `.claude.md`.
 */
export function usePromptsAppTabBarData(
  data: PromptsAppData,
): PromptsAppTabBarData {
  const openPromptTabs = usePromptsAppTabsStore((s) => s.openPromptTabs)
  const activePromptTabId = usePromptsAppTabsStore((s) => s.activePromptTabId)
  const setActivePromptTab = usePromptsAppTabsStore((s) => s.setActivePromptTab)
  const closePromptTab = usePromptsAppTabsStore((s) => s.closePromptTab)
  const closeOtherPromptTabs = usePromptsAppTabsStore(
    (s) => s.closeOtherPromptTabs,
  )
  const closeAllPromptTabs = usePromptsAppTabsStore((s) => s.closeAllPromptTabs)

  // Subscribe to the raw prompts array (stable reference until a prompt
  // is added/edited/removed) and build a lookup in a React-side memo —
  // never return a fresh object literal from a zustand selector or the
  // store will rerender on every snapshot read.
  const prompts = usePromptManagerStore((s) => s.prompts)

  const promptsById = useMemo<Record<string, PmPrompt>>(() => {
    const map: Record<string, PmPrompt> = {}
    for (const p of prompts) map[p.id] = p
    return map
  }, [prompts])

  const tabPrompts = useMemo<PmPrompt[]>(() => {
    const out: PmPrompt[] = []
    for (const id of openPromptTabs) {
      const prompt = promptsById[id]
      if (prompt) out.push(prompt)
    }
    return out
  }, [openPromptTabs, promptsById])

  const folderColorByPromptId = useMemo<Record<string, string | undefined>>(() => {
    const folderColor: Record<string, string | undefined> = {}
    for (const folder of data.folders) folderColor[folder.id] = folder.color
    const out: Record<string, string | undefined> = {}
    for (const prompt of tabPrompts) {
      out[prompt.id] = folderColor[prompt.folderId]
    }
    return out
  }, [tabPrompts, data.folders])

  const handleSelectBrowse = useCallback(() => {
    setActivePromptTab(null)
  }, [setActivePromptTab])

  const handleActivate = useCallback(
    (id: string) => {
      setActivePromptTab(id)
    },
    [setActivePromptTab],
  )

  const handleClose = useCallback(
    (id: string) => {
      closePromptTab(id)
    },
    [closePromptTab],
  )

  const handleCloseOthers = useCallback(
    (id: string) => {
      closeOtherPromptTabs(id)
    },
    [closeOtherPromptTabs],
  )

  const handleCloseAll = useCallback(() => {
    closeAllPromptTabs()
  }, [closeAllPromptTabs])

  const handleCopy = useCallback(
    (prompt: PmPrompt) => {
      void data.handleCopyPrompt(prompt)
    },
    [data],
  )

  return {
    tabPrompts,
    activePromptTabId,
    folderColorByPromptId,
    handleSelectBrowse,
    handleActivate,
    handleClose,
    handleCloseOthers,
    handleCloseAll,
    handleCopy,
  }
}
