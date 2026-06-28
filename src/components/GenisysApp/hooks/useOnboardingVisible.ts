import { useSettingsStore } from '@/store/settings-store'

export function useOnboardingVisible(): boolean {
  const isLoaded = useSettingsStore((s) => s.isLoaded)
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding)

  return isLoaded && !hasCompletedOnboarding
}
