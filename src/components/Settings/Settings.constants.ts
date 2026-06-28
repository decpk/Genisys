import { BarChart3, Bell, BotMessageSquare, BookOpen, BrainCircuit, CalendarCheck, ClipboardList, Clock3, Code, FolderTree, GitPullRequest, Info, Keyboard, LayoutDashboard, Mic, NotebookPen, Palette, SquareTerminal, Volume2, Shield, ShieldCheck, SquareKanban, User } from 'lucide-react'

import type {
  ExplorerViewMode,
  ExplorerSortField,
  ActivityBarPosition,
  SidebarPosition,
  LibraryInlineImageSize
} from '@/store/settings-store'

import type { SettingsSection, SettingsSectionItem, SettingsSectionGroup } from './Settings.types'

export const SECTION_META: Record<
  SettingsSection,
  { title: string; description: string }
> = {
  user: {
    title: 'User',
    description: 'Account and general application preferences.',
  },
  theme: {
    title: 'Theme',
    description:
      'Switch between built-in themes, schedule automatic light/dark, or design your own custom theme with a live preview.',
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Customize the Dashboard experience.',
  },
  dailyPlan: {
    title: 'Daily Plan',
    description: 'Default work hours and lunch break settings.',
  },
  explorer: {
    title: 'Explorer',
    description: 'Configure the repository Explorer view.',
  },
  terminal: {
    title: 'Terminal',
    description:
      'Customize the integrated terminal — appearance, typography, and prompts.',
  },
  security: {
    title: 'Security',
    description: 'Protect your app with a password or PIN.',
  },
  clock: {
    title: 'Clock',
    description:
      'Customize the fullscreen peek clock — face style and auto-dismiss timing.',
  },
  chat: {
    title: 'Chat',
    description: 'Configure the AI Chat assistant.',
  },
  aiAssistant: {
    title: 'AI Assistant',
    description: 'Configure default AI mode and per-app overrides.',
  },
  library: {
    title: 'Library',
    description: 'Customize the Library reading experience.',
  },
  notes: {
    title: 'Notes',
    description: 'Customize the Notes app experience.',
  },
  clipboard: {
    title: 'Clipboard',
    description: 'Configure clipboard manager behavior and AI image analysis.',
  },
  voice: {
    title: 'Voice Input',
    description: 'Configure speech-to-text and voice dictation settings.',
  },
  tts: {
    title: 'Text-to-Speech',
    description:
      'Configure text-to-speech synthesis with the Kokoro neural TTS model.',
  },
  about: {
    title: 'About',
    description: 'Application information.',
  },
  keyboard: {
    title: 'Keyboard Shortcuts',
    description: 'View and customize keyboard shortcuts for all apps.',
  },
  notifications: {
    title: 'Notifications',
    description: 'Manage notification preferences and view notification history.',
  },
  usage: {
    title: 'Usage',
    description: 'See how much time you spend in Genisys and each app.',
  },
  privacy: {
    title: 'Privacy',
    description: 'Control anonymous usage analytics and data sharing.',
  },
  developer: {
    title: 'Developer',
    description: 'Developer tools for debugging and inspecting app internals.',
  },
}

export const SETTINGS_SECTION_GROUPS: ReadonlyArray<SettingsSectionGroup> = [
  {
    label: 'General',
    items: [
      { key: 'user', label: 'User', icon: User },
      { key: 'theme', label: 'Theme', icon: Palette },
      { key: 'clock', label: 'Clock', icon: Clock3 },
      { key: 'security', label: 'Security', icon: Shield },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'dailyPlan', label: 'Daily Plan', icon: CalendarCheck },
      { key: 'notes', label: 'Notes', icon: NotebookPen },
      { key: 'library', label: 'Library', icon: BookOpen },
      { key: 'clipboard', label: 'Clipboard', icon: ClipboardList },
    ],
  },
  {
    label: 'Development',
    items: [
      { key: 'explorer', label: 'Explorer', icon: FolderTree },
      { key: 'terminal', label: 'Terminal', icon: SquareTerminal },
      { key: 'chat', label: 'Chat', icon: BotMessageSquare },
      { key: 'aiAssistant', label: 'AI Assistant', icon: BrainCircuit },
    ],
  },
  {
    label: 'Input & Output',
    items: [
      { key: 'voice', label: 'Voice Input', icon: Mic },
      { key: 'tts', label: 'Text-to-Speech', icon: Volume2 },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'keyboard', label: 'Keyboard Shortcuts', icon: Keyboard },
      { key: 'notifications', label: 'Notifications', icon: Bell },
      { key: 'usage', label: 'Usage', icon: BarChart3 },
      { key: 'privacy', label: 'Privacy', icon: ShieldCheck },
      ...(import.meta.env.DEV ? [{ key: 'developer' as const, label: 'Developer', icon: Code }] : []),
      { key: 'about', label: 'About', icon: Info },
    ],
  },
]

export const SETTINGS_SECTIONS: ReadonlyArray<SettingsSectionItem> = SETTINGS_SECTION_GROUPS.flatMap(
  (group) => group.items
)

export const CHAT_WIDTH_OPTIONS = [60, 70, 80, 90, 100] as const

export const EXPLORER_VIEW_OPTIONS: ExplorerViewMode[] = [
  'list',
  'grid',
  'detailed',
  'compact',
  'thumbnail'
] as const

export const ACTIVITY_BAR_OPTIONS: { value: ActivityBarPosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' }
] as const

export const SIDEBAR_OPTIONS: { value: SidebarPosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
] as const

export const EXPLORER_SORT_FIELD_OPTIONS: { value: ExplorerSortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'extension', label: 'Extension' },
  { value: 'path', label: 'Full Path' }
] as const

export { READING_FONT_OPTIONS } from '@/lib/fonts'

export { CONTENT_WIDTH_OPTIONS } from '@/lib/content-width'

export const LIBRARY_INLINE_IMAGE_SIZE_OPTIONS: {
  value: LibraryInlineImageSize
  label: string
}[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'full', label: 'Full' },
] as const
