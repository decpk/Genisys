import { DashboardLazyLoadSetting } from '../components/DashboardLazyLoadSetting'
import { AppModelSetting } from '../components/AppModelSetting'

export function DashboardSection(): React.JSX.Element {
  return (
    <>
      <DashboardLazyLoadSetting />
      <AppModelSetting
        appId="dashboard"
        label="AI Insights Model"
        description="Model used for dashboard AI insights (e.g. stock analysis). Falls back to the default AI model."
      />
    </>
  )
}
