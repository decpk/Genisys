import { memo } from 'react'

export const PrivacySection = memo(function PrivacySection(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-0.5 pr-6 max-w-xl">
      <span className="text-sm font-medium text-foreground">
        Usage analytics
      </span>
      <span className="text-xs text-muted-foreground leading-relaxed">
        To help us improve Genisys, this app records sign-in events and per-app
        usage time, tagged with your sign-in email. No file contents or
        other personal data are collected. Analytics are always on for this
        build and can’t be turned off here.
      </span>
    </div>
  );
})
