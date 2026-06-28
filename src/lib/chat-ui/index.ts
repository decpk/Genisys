/**
 * Shared chat UI primitives — used by both the full Chat app
 * (`src/components/Chat`) and every AI Assistant right-panel surface
 * (`src/right-panels/AIAssistantPanel/*`).
 *
 * Add new shared primitives here so a single change propagates to all
 * consumers (Chat, Code AI, Notes AI, Library AI, APIClient AI, DailyPlan AI,
 * ClipboardManager AI, …).
 */
export * from './MessageActionBar'
export * from './ChatEmptyState'
export * from './ChatComposerShell'
export * from './ChatSurfaceHeader'
export * from './ToolActivityRenderer'
export * from './AIPlanProgress'
