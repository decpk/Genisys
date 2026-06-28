import { Zap, ShieldCheck, Hand, type LucideIcon } from 'lucide-react'

export type ExplorerAIMode = 'fully-auto' | 'auto-safe' | 'manual'

export interface ExplorerAIModeOption {
  id: ExplorerAIMode
  label: string
  description: string
  icon: LucideIcon
}

export const EXPLORER_AI_MODES: ExplorerAIModeOption[] = [
  {
    id: 'fully-auto',
    label: 'Auto',
    description: 'Executes all operations immediately without asking',
    icon: Zap,
  },
  {
    id: 'auto-safe',
    label: 'Safe',
    description: 'Asks confirmation only for destructive operations',
    icon: ShieldCheck,
  },
  {
    id: 'manual',
    label: 'Manual',
    description: 'Asks confirmation before every operation',
    icon: Hand,
  },
]

export const EXPLORER_AI_MODE_MAP: Record<ExplorerAIMode, ExplorerAIModeOption> =
  Object.fromEntries(
    EXPLORER_AI_MODES.map((m) => [m.id, m]),
  ) as Record<ExplorerAIMode, ExplorerAIModeOption>

export const MODE_SYSTEM_INSTRUCTIONS: Record<ExplorerAIMode, string | null> = {
  'fully-auto':
    'IMPORTANT: Execute ALL file operations immediately and directly using your tools. Do NOT ask for confirmation. Do NOT use explorer-confirm blocks. Just perform the operations and report results.',
  'auto-safe': null, // Default behavior — backend already handles confirmations for destructive ops
  'manual':
    'IMPORTANT: Before performing ANY file operation (create, delete, rename, move, copy, write), you MUST first describe what you plan to do and use an explorer-confirm block to ask for explicit user confirmation. Never execute operations without confirmation.',
}
