import { createElement, type ReactNode } from 'react'
import { toast as sonnerToast, type ExternalToast } from 'sonner'

import { NotificationToast } from './NotificationToast'
import { getSourceLabel } from './source-labels'
import type { NotificationType, NotificationAction } from './notification.types'

// ─── Scoped Toast ────────────────────────────────────────────────────
//
// A drop-in replacement for sonner's `toast` that renders our iOS-style
// NotificationToast card with an app-name identity line, derived from a
// `source` slug. Existing call sites only swap their import + bind a
// source; every `toast.success(...)` / `toast.error(...)` call body stays
// unchanged.
//
//   import { scopedToast } from '@/frameworks/notification'
//   const toast = scopedToast('messages')
//   toast.success('You're online again')   // → shows "Messages" + message
//
// These are transient UI feedback toasts and are intentionally NOT
// recorded to the notification history (use `notify()` for that).

/** Options accepted by scoped toast methods — structurally sonner-compatible. */
export type ScopedToastOptions = ExternalToast

/** Maps a sonner `action` option to our NotificationAction shape (if present). */
function extractAction(action: ExternalToast['action']): NotificationAction | null {
  if (
    action &&
    typeof action === 'object' &&
    'label' in action &&
    'onClick' in action &&
    typeof action.onClick === 'function'
  ) {
    const a = action as { label: ReactNode; onClick: (...args: unknown[]) => void }
    return { label: a.label as unknown as string, onClick: () => a.onClick() }
  }
  return null
}

/**
 * Render a scoped, app-attributed toast using the shared NotificationToast card.
 *
 * When a `description` is supplied, the primary `message` becomes the bold
 * title and the description becomes the secondary line — mirroring sonner's
 * message/description hierarchy.
 */
function renderScopedToast(
  source: string,
  type: NotificationType,
  message: ReactNode,
  opts?: ScopedToastOptions,
  loading = false,
): string | number {
  const appName = getSourceLabel(source)
  const hasDescription = opts?.description != null
  const action = extractAction(opts?.action)

  // IMPORTANT: only set `id` when the caller actually supplied one.
  //
  // Sonner's `custom()` does `create({ jsx: jsx(id), id, ...data })`. When `data`
  // carries `id: undefined`, that trailing spread overwrites the id Sonner just
  // generated for the `jsx(id)` callback, and `create()` then assigns a *different*
  // counter id to the stored toast. The result: our `onDismiss` calls
  // `dismiss(toastId)` with the jsx id while the live toast holds another id, so
  // click-to-dismiss silently matches nothing. Omitting the key keeps them in sync.
  // `dismissible: true` keeps Sonner's swipe-to-dismiss enabled; the custom close
  // button handles click-to-dismiss itself.
  //
  // Loading toasts persist until explicitly updated/dismissed (no auto-close),
  // mirroring sonner's native `toast.loading` behaviour.
  const duration = loading ? opts?.duration ?? Infinity : opts?.duration
  const options: ScopedToastOptions = { duration, dismissible: true }
  if (opts?.id != null) options.id = opts.id

  return sonnerToast.custom(
    (toastId) =>
      createElement(NotificationToast, {
        toastId,
        type,
        appName,
        title: (hasDescription ? message : undefined) as string | undefined,
        message: (hasDescription ? opts?.description : message) as unknown as string,
        loading,
        actions: action ? [action] : [],
        onDismiss: () => sonnerToast.dismiss(toastId),
      }),
    options,
  )
}

export interface ScopedToast {
  success: (message: ReactNode, opts?: ScopedToastOptions) => string | number
  error: (message: ReactNode, opts?: ScopedToastOptions) => string | number
  warning: (message: ReactNode, opts?: ScopedToastOptions) => string | number
  info: (message: ReactNode, opts?: ScopedToastOptions) => string | number
  message: (message: ReactNode, opts?: ScopedToastOptions) => string | number
  /** Progress toast — renders the custom card with a spinner; persists until updated/dismissed. */
  loading: (message: ReactNode, opts?: ScopedToastOptions) => string | number
  /** Custom JSX toasts pass through to sonner unchanged. */
  custom: typeof sonnerToast.custom
  dismiss: typeof sonnerToast.dismiss
}

/**
 * Create a toast API bound to a `source`, so every toast it produces is
 * attributed to the corresponding app name (iOS-style).
 */
export function scopedToast(source: string): ScopedToast {
  return {
    success: (message, opts) => renderScopedToast(source, 'success', message, opts),
    error: (message, opts) => renderScopedToast(source, 'error', message, opts),
    warning: (message, opts) => renderScopedToast(source, 'warning', message, opts),
    info: (message, opts) => renderScopedToast(source, 'info', message, opts),
    message: (message, opts) => renderScopedToast(source, 'info', message, opts),
    loading: (message, opts) => renderScopedToast(source, 'info', message, opts, true),
    custom: sonnerToast.custom,
    dismiss: sonnerToast.dismiss,
  }
}
