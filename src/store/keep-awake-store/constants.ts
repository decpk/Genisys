/**
 * User-facing notice shown when the "Stay Awake" presence nudge needs macOS
 * Accessibility permission. The flow arms an auto-enable that fires when the
 * user returns to Genisys after granting it (see `recheckPermissionAction`).
 */
export const ACCESSIBILITY_NOTICE =
  'Genisys needs Accessibility permission to keep you marked Available in ' +
  'Slack and other presence-aware apps. Enable Genisys under System Settings → ' +
  'Privacy & Security → Accessibility, then come back — it switches on automatically.'
