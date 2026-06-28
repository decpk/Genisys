import { memo } from "react";
import { Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

import { Switch } from "@/components/ui/switch";
import { IconButton } from "@/components/ui/icon-button";
import { useLiveScoresStore } from "@/store/live-scores-store";
import type {
  LiveSportTileConfig,
  NotifyChannel,
} from "./LiveSportsTile.types";

const CHANNEL_OPTIONS: { value: NotifyChannel; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "app", label: "In-app" },
  { value: "os", label: "OS" },
  { value: "both", label: "Both" },
];

interface SportsNotificationSettingsProps {
  tile: LiveSportTileConfig;
}

export const SportsNotificationSettings = memo(
  function SportsNotificationSettings({
    tile,
  }: SportsNotificationSettingsProps): React.JSX.Element {
    const setNotifyOnScore = useLiveScoresStore((s) => s.setNotifyOnScore);
    const setNotifyOnStatus = useLiveScoresStore((s) => s.setNotifyOnStatus);
    const setNotifyOnPeriod = useLiveScoresStore((s) => s.setNotifyOnPeriod);
    const setNotifyWhenFocused = useLiveScoresStore(
      (s) => s.setNotifyWhenFocused,
    );
    const setNotifyWhenUnfocused = useLiveScoresStore(
      (s) => s.setNotifyWhenUnfocused,
    );
    const setAutoDeleteOnEnd = useLiveScoresStore((s) => s.setAutoDeleteOnEnd);

    const hasAnyNotification =
      tile.notifyOnScore || tile.notifyOnStatus || tile.notifyOnPeriod;

    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <IconButton
            tooltip="Notification settings"
            tooltipSide="bottom"
            size="xs"
          >
            <Bell
              size={14}
              className={
                hasAnyNotification
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              }
            />
          </IconButton>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-md animate-in fade-in-0 zoom-in-95"
            sideOffset={5}
            align="end"
          >
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-foreground">
                Notifications
              </h4>

              {/* Event toggles */}
              <div className="flex flex-col gap-2">
                <ToggleRow
                  label="Score changes"
                  checked={tile.notifyOnScore}
                  onChange={(v) => setNotifyOnScore(tile.id, v)}
                />
                <ToggleRow
                  label="Status changes"
                  description="Live start, match end"
                  checked={tile.notifyOnStatus}
                  onChange={(v) => setNotifyOnStatus(tile.id, v)}
                />
                <ToggleRow
                  label="Period changes"
                  description="Over, quarter, half, set"
                  checked={tile.notifyOnPeriod}
                  onChange={(v) => setNotifyOnPeriod(tile.id, v)}
                />
              </div>

              {/* Channel selectors */}
              <div className="border-t border-border pt-2 flex flex-col gap-2">
                <ChannelSelect
                  label="When app focused"
                  value={tile.notifyWhenFocused}
                  onChange={(v) => setNotifyWhenFocused(tile.id, v)}
                />
                <ChannelSelect
                  label="When in background"
                  value={tile.notifyWhenUnfocused}
                  onChange={(v) => setNotifyWhenUnfocused(tile.id, v)}
                />
              </div>

              {/* Auto-delete */}
              <div className="border-t border-border pt-2">
                <ToggleRow
                  label="Auto-remove on end"
                  description="Remove tile 5 min after match ends"
                  checked={tile.autoDeleteOnEnd}
                  onChange={(v) => setAutoDeleteOnEnd(tile.id, v)}
                />
              </div>
            </div>

            <Popover.Arrow className="fill-border" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

// ── Internal sub-components ──────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-[10px] text-muted-foreground leading-tight">
            {description}
          </span>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="shrink-0 scale-75"
      />
    </div>
  );
}

function ChannelSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: NotifyChannel;
  onChange: (v: NotifyChannel) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as NotifyChannel)}
        className="text-[10px] bg-accent border border-transparent rounded px-1.5 py-0.5 text-foreground outline-none cursor-pointer focus:border-input focus:ring-1 focus:ring-ring/20"
      >
        {CHANNEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
