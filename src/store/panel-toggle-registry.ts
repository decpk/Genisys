import { getEffectiveActiveApp } from '@/frameworks/keyboard-shortcut/scopeOverride'

// ── Sidebar toggle registry ─────────────────────────────────────────

const sidebarToggles = new Map<string, () => void>()

export function registerSidebarToggle(appId: string, toggle: () => void): () => void {
  sidebarToggles.set(appId, toggle)
  return () => { sidebarToggles.delete(appId) }
}

export function toggleActiveSidebar(): void {
  const appId = getEffectiveActiveApp()
  sidebarToggles.get(appId)?.()
}

// ── Right panel toggle registry ──────────────────────────────────────

const rightPanelToggles = new Map<string, () => void>()

export function registerRightPanelToggle(appId: string, toggle: () => void): () => void {
  rightPanelToggles.set(appId, toggle)
  return () => { rightPanelToggles.delete(appId) }
}

export function toggleActiveRightPanel(): void {
  const appId = getEffectiveActiveApp()
  rightPanelToggles.get(appId)?.()
}

// ── Editor toggle registry ───────────────────────────────────────────

let editorToggleFn: (() => void) | null = null

export function registerEditorToggle(toggle: () => void): () => void {
  editorToggleFn = toggle
  return () => { editorToggleFn = null }
}

export function triggerEditorToggle(): void {
  editorToggleFn?.()
}
