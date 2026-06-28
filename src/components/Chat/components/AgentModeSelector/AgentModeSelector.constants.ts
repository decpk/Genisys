import { Bot, MessageCircleQuestion, ListTodo, type LucideIcon } from 'lucide-react'

export type AgentMode = 'agent' | 'ask' | 'plan'

export interface AgentModeOption {
  id: AgentMode
  label: string
  description: string
  icon: LucideIcon
}

export const AGENT_MODES: AgentModeOption[] = [
  {
    id: 'agent',
    label: 'Agent',
    description: 'Autonomous coding agent that can make changes',
    icon: Bot,
  },
  {
    id: 'ask',
    label: 'Ask',
    description: 'Answers questions, explains code, never modifies files',
    icon: MessageCircleQuestion,
  },
  {
    id: 'plan',
    label: 'Plan',
    description: 'Researches and outlines multi-step plans, never implements',
    icon: ListTodo,
  },
]

export const AGENT_MODE_MAP: Record<AgentMode, AgentModeOption> = Object.fromEntries(
  AGENT_MODES.map((m) => [m.id, m]),
) as Record<AgentMode, AgentModeOption>
