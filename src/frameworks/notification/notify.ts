import { createElement } from 'react'
import { toast } from 'sonner'

import { useSettingsStore } from '@/store/settings-store'
import type { NotifyOptions, NotificationType } from './notification.types'
import { NotificationToast } from './NotificationToast'
import { sendOSNotification } from './os-notification'
import { shouldSuppressForDnd, DND_SUPPRESSED_META_KEY } from './dnd'
import { getSourceLabel } from './source-labels'

const TYPE_TITLES: Record<NotificationType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
}

function trimMessage(message: string, maxLength = 150): string {
  if (message.length <= maxLength) return message
  const trimmed = message.slice(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…'
}

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Unified notification API.
 *
 * ```ts
 * notify({ source: 'chat', message: 'Copied to clipboard' })
 * notify({ type: 'success', source: 'explorer', message: 'File exported', actions: [{ label: 'Open', onClick: fn }] })
 * notify({ channel: 'os', source: 'deep-research', type: 'success', message: 'Research complete' })
 * ```
 */
export function notify(options: NotifyOptions): void {
  const {
    source,
    message,
    type = "info",
    channel = "app",
    title,
    icon,
    avatar,
    onClick,
    iconName,
    actions = [],
    duration = 6000,
    dedupeKey,
    meta,
  } = options;

  // Friendly app name derived from the source slug — surfaces *which*
  // app sent the notification (iOS-style attribution).
  const appName = getSourceLabel(source)
  // OS popups + DB history want a non-empty title, so fall back to the
  // generic type title when the caller didn't provide a custom one.
  const resolvedTitle = title?.trim() ? title : TYPE_TITLES[type]
  // The in-app toast shows the app name as its identity line, so only
  // surface a *custom* title here — avoids redundant 'Success'/'Error'.
  const toastTitle = title?.trim() ? title : undefined

  // Enforce max 2 actions
  const boundedActions = actions.slice(0, 2)
  const trimmedMessage = trimMessage(message)
  // A caller-supplied `dedupeKey` becomes the stable toast + history id, so
  // repeated identical notifications coalesce: Sonner replaces the live toast
  // with the same id (instead of stacking another), and the history row is
  // upserted via `INSERT OR REPLACE`. Falls back to a fresh random id.
  const id = dedupeKey ?? generateId()

  // ── DND gating ────────────────────────────────────────────────────
  // Errors always bypass DND so critical failures are still surfaced.
  // Otherwise, when DND is active, suppress visible delivery (toast +
  // OS popup) but still record to history with a `suppressedByDnd` flag
  // so the user can review what they missed in the Notifications panel.
  const dndSuppressed = type !== 'error' && shouldSuppressForDnd()

  // Merge DND meta flag into caller-provided meta (caller wins for
  // any other keys; we only contribute the suppression flag).
  const finalMeta: Record<string, unknown> | undefined = dndSuppressed
    ? { ...(meta ?? {}), [DND_SUPPRESSED_META_KEY]: true }
    : meta

  if (!dndSuppressed) {
    if (channel === 'os') {
      // OS-level notification — Tauri handles Mac/Windows/Linux differences
      sendOSNotification(resolvedTitle, trimmedMessage).then((sent) => {
        if (!sent) {
          // Fallback to app notification if OS notification fails
          showAppToast(id, type, appName, toastTitle, trimmedMessage, icon, boundedActions, duration, avatar, onClick)
        }
      })
    } else {
      showAppToast(id, type, appName, toastTitle, trimmedMessage, icon, boundedActions, duration, avatar, onClick)
    }
  }

  // Record to DB. Only 'app'-channel notifications are persisted by
  // default. When DND suppresses an 'os' notification, we still record
  // it so the user has a trail — the channel field on the row reflects
  // the original intent.
  const shouldRecord = channel === 'app' || dndSuppressed
  if (shouldRecord) {
    recordNotification(id, type, channel, source, resolvedTitle, trimmedMessage, iconName, boundedActions, finalMeta)
  }
}

function showAppToast(
  id: string,
  type: NotificationType,
  appName: string,
  title: string | undefined,
  message: string,
  icon: NotifyOptions['icon'],
  actions: NotifyOptions['actions'],
  duration: number,
  avatar: NotifyOptions['avatar'],
  onClick: NotifyOptions['onClick'],
): void {
  toast.custom(
    (toastId) =>
      createElement(NotificationToast, {
        toastId,
        type,
        appName,
        title,
        message,
        icon,
        avatar,
        onClick,
        actions: actions ?? [],
        onDismiss: () => toast.dismiss(toastId),
      }),
    // `dismissible: true` keeps Sonner's swipe-to-dismiss enabled; the custom
    // close button handles click-to-dismiss itself.
    { id, duration, dismissible: true },
  )
}

function recordNotification(
  id: string,
  type: NotificationType,
  channel: string,
  source: string,
  title: string,
  message: string,
  iconName?: string,
  actions?: NotifyOptions['actions'],
  meta?: Record<string, unknown>,
): void {
  const recordEnabled = useSettingsStore.getState().recordNotifications
  if (!recordEnabled) return

  const actionsJson = actions?.length
    ? JSON.stringify(actions.map((a) => ({ label: a.label })))
    : null
  const metaJson = meta ? JSON.stringify(meta) : null

  // Fire-and-forget save
  window.api
    .saveNotification({
      id,
      type,
      channel,
      source,
      title,
      message,
      icon: iconName ?? null,
      actions: actionsJson,
      meta: metaJson,
      read: false,
      createdAt: new Date().toISOString(),
      expiresAt: null,
    })
    .catch(() => {
      /* silently ignore DB errors */
    })
}
