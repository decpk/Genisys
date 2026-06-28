import type { PanelEntry } from './AiPanelToolsSetting.types'

export const PANEL_ENTRIES: PanelEntry[] = [
  { id: 'chat', label: 'Chat', description: 'Main AI Chat' },
  { id: 'notes', label: 'Notes', description: 'Notes AI assistant' },
  { id: 'library', label: 'Library', description: 'Library AI assistant' },
  { id: 'apiclient', label: 'API Client', description: 'API Client AI assistant' },
  { id: 'dailyplan', label: 'Daily Plan', description: 'Daily Plan AI assistant' },
  { id: 'explorer', label: 'Explorer', description: 'Explorer AI assistant' },
  { id: 'code', label: 'Code', description: 'Code editor AI assistant' },
  { id: 'mockserver', label: 'Mock Server', description: 'Mock Server AI assistant' },
]

/** Known max-tool limits by provider prefix */
export const PROVIDER_MAX_TOOLS: Record<string, number> = {
  claude: 4096,
  gpt: 128,
  o3: 128,
  o4: 128,
  gemini: 128,
}
