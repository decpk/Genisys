export const notificationToastStyles = {
  // Structural-only — elevation/material is composed separately via
  // `getNotificationElevation()` so the highlight stays tunable + testable.
  root: 'notification-toast group relative w-[356px] overflow-hidden rounded-[20px]',
  content: 'flex gap-3 p-4',
  contentClickable: 'cursor-pointer',
} as const
