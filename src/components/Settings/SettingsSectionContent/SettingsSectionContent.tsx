import { lazy, memo } from 'react'

import type { SettingsSectionContentProps } from './SettingsSectionContent.types'

const UserSection = lazy(() =>
  import('../sections/UserSection').then((m) => ({ default: m.UserSection })),
)
const DashboardSection = lazy(() =>
  import('../sections/DashboardSection').then((m) => ({
    default: m.DashboardSection,
  })),
)
const DailyPlanSection = lazy(() =>
  import('../sections/DailyPlanSection').then((m) => ({
    default: m.DailyPlanSection,
  })),
)
const ExplorerSection = lazy(() =>
  import('../sections/ExplorerSection').then((m) => ({
    default: m.ExplorerSection,
  })),
)
const TerminalSection = lazy(() =>
  import('../sections/TerminalSection').then((m) => ({
    default: m.TerminalSection,
  })),
)
const ChatSection = lazy(() =>
  import('../sections/ChatSection').then((m) => ({
    default: m.ChatSection,
  })),
)
const AIAssistantSection = lazy(() =>
  import('../sections/AIAssistantSection').then((m) => ({
    default: m.AIAssistantSection,
  })),
)
const LibrarySection = lazy(() =>
  import('../sections/LibrarySection').then((m) => ({
    default: m.LibrarySection,
  })),
)
const NotesSection = lazy(() =>
  import('../sections/NotesSection').then((m) => ({
    default: m.NotesSection,
  })),
)
const AboutSectionWrapper = lazy(() =>
  import('../sections/AboutSectionWrapper').then((m) => ({
    default: m.AboutSectionWrapper,
  })),
)
const KeyboardShortcutsSection = lazy(() =>
  import('../sections/KeyboardShortcutsSection').then((m) => ({
    default: m.KeyboardShortcutsSection,
  })),
)
const NotificationsSection = lazy(() =>
  import('../sections/NotificationsSection').then((m) => ({
    default: m.NotificationsSection,
  })),
)
const PrivacySection = lazy(() =>
  import('../sections/PrivacySection').then((m) => ({
    default: m.PrivacySection,
  })),
)
const UsageSection = lazy(() =>
  import('../sections/UsageSection').then((m) => ({
    default: m.UsageSection,
  })),
)
const SecuritySection = lazy(() =>
  import('../sections/SecuritySection').then((m) => ({
    default: m.SecuritySection,
  })),
)
const ClockSection = lazy(() =>
  import('../sections/ClockSection').then((m) => ({
    default: m.ClockSection,
  })),
)
const DeveloperSection = lazy(() =>
  import('../sections/DeveloperSection').then((m) => ({
    default: m.DeveloperSection,
  })),
)
const VoiceSection = lazy(() =>
  import('../sections/VoiceSection').then((m) => ({
    default: m.VoiceSection,
  })),
)
const TtsSection = lazy(() =>
  import('../sections/TtsSection').then((m) => ({
    default: m.TtsSection,
  })),
)
const ClipboardSection = lazy(() =>
  import('../sections/ClipboardSection').then((m) => ({
    default: m.ClipboardSection,
  })),
)
const ThemeSection = lazy(() =>
  import('../sections/ThemeSection').then((m) => ({
    default: m.ThemeSection,
  })),
)

/**
 * Pure section dispatcher. Maps a `SettingsSection` value to its lazy
 * section component. Used by both the full `Settings` app and the
 * `SettingsSidePanel` drawer so they render identical content.
 */
export const SettingsSectionContent = memo(function SettingsSectionContent(
  props: SettingsSectionContentProps,
): React.JSX.Element {
  const { section } = props
  switch (section) {
    case 'user':
      return <UserSection />
    case 'clock':
      return <ClockSection />
    case 'theme':
      return <ThemeSection />
    case 'security':
      return <SecuritySection />
    case 'dashboard':
      return <DashboardSection />
    case 'dailyPlan':
      return <DailyPlanSection />
    case 'explorer':
      return <ExplorerSection />
    case 'terminal':
      return <TerminalSection />
    case 'chat':
      return <ChatSection />
    case 'aiAssistant':
      return <AIAssistantSection />
    case 'library':
      return <LibrarySection />
    case 'notes':
      return <NotesSection />
    case 'clipboard':
      return <ClipboardSection />
    case 'voice':
      return <VoiceSection />
    case 'tts':
      return <TtsSection />
    case 'keyboard':
      return <KeyboardShortcutsSection />
    case 'notifications':
      return <NotificationsSection />
    case 'usage':
      return <UsageSection />
    case 'privacy':
      return <PrivacySection />
    case 'developer':
      return <DeveloperSection />
    case 'about':
      return <AboutSectionWrapper />
  }
})
