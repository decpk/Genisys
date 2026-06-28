/**
 * AI Auto-Context Provider Registry
 * ─────────────────────────────────
 *
 * Each AI surface (right-panel for Code, Library, Notes, DailyPlan,
 * APIClient, Clipboard, …) can REGISTER an `AIContextProvider` that
 * exposes its current ambient state as a string snapshot.
 *
 * On every LLM request, `buildAutoContextBlock()` reads the currently
 * "active" provider and embeds its snapshot into the system prompt,
 * so the model can answer surface-specific questions without having
 * to call `getCurrentContext` first.
 *
 * Providers are intentionally OPT-IN: a panel that hasn't registered
 * still gets the environment block (OS, date, app), it just doesn't
 * contribute a `<workspace_info>` body.
 *
 * Activation lifecycle (typical):
 *   - In a panel's mount effect: `setActiveAIContextProvider(provider)`
 *   - In its unmount cleanup:    `clearActiveAIContextProvider(provider.id)`
 *
 * The "active" slot is single-valued by design: only one AI Assistant
 * surface is visible at a time on the right panel.
 */

export interface AIContextProvider {
  /** Stable id, e.g. 'notes', 'library', 'code'. Used for clear/replace. */
  id: string
  /**
   * Return the surface-specific context as a STRING snapshot, or `null`
   * if there is no useful context right now. Called once per LLM
   * request — keep it cheap (read store, format, return).
   *
   * The returned string is wrapped in `<workspace_info surface="...">
   * … </workspace_info>` by the caller — do NOT include those tags
   * yourself.
   */
  getContext(): string | null
}

let activeProvider: AIContextProvider | null = null

export function setActiveAIContextProvider(provider: AIContextProvider): void {
  activeProvider = provider
}

export function clearActiveAIContextProvider(id: string): void {
  if (activeProvider?.id === id) activeProvider = null
}

export function getActiveAIContextProvider(): AIContextProvider | null {
  return activeProvider
}
