import { memo, useCallback, useRef } from 'react'
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  BellOff,
  Inbox,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { IconButton } from '@/components/ui/icon-button'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { useSettingsStore } from '@/store/settings-store'
import type { NotificationType } from '@/frameworks/notification'
import { DndScheduleSetting } from '@/components/Settings/components/DndScheduleSetting'

import { NotificationRow } from './components/NotificationRow'
import { CompletionChimeSettings } from './components/CompletionChimeSettings'
import { useNotificationsData } from './useNotificationsData'

// ── Filter options ───────────────────────────────────────────────────

const TYPE_FILTERS: { value: NotificationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
]

const READ_FILTERS: { value: 'all' | 'read' | 'unread'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

const pillBase = 'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer'
const pillActive = 'bg-foreground/10 text-foreground shadow-sm'
const pillInactive = 'text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5'

// ── Empty / disabled states ──────────────────────────────────────────

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <Bell size={28} className="text-muted-foreground/25 mb-3" />
      <p className="text-sm font-medium text-muted-foreground/70 mb-0.5">No notifications</p>
      <p className="text-xs text-muted-foreground/40">
        Notifications from all apps will appear here.
      </p>
    </div>
  )
}

function RecordingDisabledState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <BellOff size={28} className="text-muted-foreground/25 mb-3" />
      <p className="text-sm font-medium text-muted-foreground/70 mb-0.5">Recording is off</p>
      <p className="text-xs text-muted-foreground/40">
        Enable recording to start saving notification history.
      </p>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────

export const NotificationsSection = memo(function NotificationsSection(): React.JSX.Element {
  const recordNotifications = useSettingsStore((s) => s.recordNotifications)
  const setRecordNotifications = useSettingsStore((s) => s.setRecordNotifications)

  return (
    <div className="absolute inset-0 flex flex-col pt-4 pl-6">
      {/* Header — title + record toggle */}
      <div className="flex items-center justify-between shrink-0 mb-4 pr-6">
        <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-muted-foreground">Record</span>
          <Switch
            checked={recordNotifications}
            onCheckedChange={setRecordNotifications}
          />
        </label>
      </div>

      {/* Do Not Disturb — additive, sits above the recording history */}
      <div className="shrink-0 mb-4 pr-6 border-b border-border/50">
        <DndScheduleSetting />
      </div>

      {/* AI completion chime — fires a short sound when AI responses finish */}
      <div className="shrink-0 mb-4">
        <CompletionChimeSettings />
      </div>

      {recordNotifications ? (
        <NotificationHistory />
      ) : (
        <RecordingDisabledState />
      )}
    </div>
  );
})

// ── NotificationHistory ──────────────────────────────────────────────

const NotificationHistory = memo(function NotificationHistory(): React.JSX.Element {
  const {
    notifications,
    hasMore,
    isLoading,
    filters,
    setFilters,
    loadMore,
    markRead,
    markAllRead,
    removeOne,
    removeAll,
    refresh,
  } = useNotificationsData()

  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !hasMore || isLoading) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore])

  const activeType = filters.notificationType ?? 'all'
  const activeRead = filters.read === undefined ? 'all' : filters.read ? 'read' : 'unread'

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar — type pills | divider | read pills | spacer | actions */}
      <div className="flex items-center gap-2 mb-3 shrink-0 pr-6">
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-secondary/40">
          {TYPE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                setFilters({
                  ...filters,
                  notificationType:
                    value === "all" ? undefined : (value as NotificationType),
                })
              }
              className={cn(
                pillBase,
                activeType === value ? pillActive : pillInactive,
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border/60" />

        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-secondary/40">
          {READ_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                setFilters({
                  ...filters,
                  read: value === "all" ? undefined : value === "read",
                })
              }
              className={cn(
                pillBase,
                activeRead === value ? pillActive : pillInactive,
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="Refresh"
            onClick={refresh}
          >
            <RefreshCw size={13} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="Mark all read"
            onClick={markAllRead}
          >
            <CheckCheck size={13} />
          </IconButton>
          <IconButton
            variant="destructive"
            size="sm"
            tooltip="Remove all"
            onClick={removeAll}
          >
            <Trash2 size={13} />
          </IconButton>
        </div>
      </div>

      {/* Notification list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-6 pb-2"
      >
        {notifications.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <>
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onMarkRead={markRead}
                onRemove={removeOne}
              />
            ))}

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <AppLoaderGlyph
                  size={14}
                  className="text-muted-foreground/50"
                />
              </div>
            )}

            {!hasMore && notifications.length > 0 && (
              <div className="flex flex-col items-center gap-1.5 py-20 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                <Inbox size={16} className="text-muted-foreground/20" />
                <p className="text-[10px] text-muted-foreground/30">
                  That&apos;s everything
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
})
