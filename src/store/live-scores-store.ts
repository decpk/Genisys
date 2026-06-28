import { create } from 'zustand'

import type { TileWidth } from '@/store/dashboard-store'
import type {
  LiveSportTileConfig,
  NotifyChannel,
  RefreshInterval,
  SportKey,
} from "@/components/Dashboard/components/LiveSportsTile/LiveSportsTile.types";

// ── Types ────────────────────────────────────────────────────────────

interface LiveScoresState {
  tiles: LiveSportTileConfig[]
  isLoaded: boolean
}

interface LiveScoresActions {
  loadTiles: () => Promise<void>;
  addSportTile: (params: { query: string; sportKey: SportKey }) => string;
  removeSportTile: (id: string) => void;
  setRefreshInterval: (id: string, ms: RefreshInterval) => void;
  setTileWidth: (id: string, width: TileWidth) => void;
  setSourceUrl: (id: string, url: string) => void;
  setNotifyOnScore: (id: string, enabled: boolean) => void;
  setNotifyOnStatus: (id: string, enabled: boolean) => void;
  setNotifyOnPeriod: (id: string, enabled: boolean) => void;
  setNotifyWhenFocused: (id: string, channel: NotifyChannel) => void;
  setNotifyWhenUnfocused: (id: string, channel: NotifyChannel) => void;
  setAutoDeleteOnEnd: (id: string, enabled: boolean) => void;
  findTileByQuery: (query: string) => LiveSportTileConfig | undefined;
}

// ── Helpers ──────────────────────────────────────────────────────────

function generateId(): string {
  return `live-sport-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function persist(tiles: LiveSportTileConfig[]): void {
  window.api?.saveLiveSportsTiles(tiles)
}

// ── Store ────────────────────────────────────────────────────────────

export const useLiveScoresStore = create<LiveScoresState & LiveScoresActions>()(
  (set, get) => ({
    tiles: [],
    isLoaded: false,

    loadTiles: async () => {
      if (get().isLoaded) return;
      try {
        const raw = await window.api.loadLiveSportsTiles();
        const tiles = (raw ?? []).map((t: LiveSportTileConfig) => ({
          ...t,
          refreshIntervalMs: t.refreshIntervalMs ?? (60_000 as RefreshInterval),
          tileWidth: t.tileWidth ?? ("half" as TileWidth),
          sourceUrl: t.sourceUrl ?? "",
          notifyOnScore: t.notifyOnScore ?? true,
          notifyOnStatus: t.notifyOnStatus ?? true,
          notifyOnPeriod: t.notifyOnPeriod ?? false,
          notifyWhenFocused: t.notifyWhenFocused ?? "os",
          notifyWhenUnfocused: t.notifyWhenUnfocused ?? "os",
          autoDeleteOnEnd: t.autoDeleteOnEnd ?? true,
        }));
        set({ tiles, isLoaded: true });
      } catch (e) {
        console.error("[live-scores-store] loadTiles failed:", e);
        set({ isLoaded: true });
      }
    },

    addSportTile: ({ query, sportKey }) => {
      const tile: LiveSportTileConfig = {
        id: generateId(),
        query,
        sportKey,
        createdAt: new Date().toISOString(),
        refreshIntervalMs: 60_000,
        tileWidth: "half",
        sourceUrl: "",
        notifyOnScore: true,
        notifyOnStatus: true,
        notifyOnPeriod: false,
        notifyWhenFocused: "os",
        notifyWhenUnfocused: "os",
        autoDeleteOnEnd: true,
      };
      const updated = [...get().tiles, tile];
      set({ tiles: updated });
      persist(updated);
      return tile.id;
    },

    removeSportTile: (id) => {
      const updated = get().tiles.filter((t) => t.id !== id);
      set({ tiles: updated });
      persist(updated);
    },

    setRefreshInterval: (id, ms) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, refreshIntervalMs: ms } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setTileWidth: (id, width) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, tileWidth: width } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setSourceUrl: (id, url) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, sourceUrl: url } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setNotifyOnScore: (id, enabled) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, notifyOnScore: enabled } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setNotifyOnStatus: (id, enabled) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, notifyOnStatus: enabled } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setNotifyOnPeriod: (id, enabled) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, notifyOnPeriod: enabled } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setNotifyWhenFocused: (id, channel) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, notifyWhenFocused: channel } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setNotifyWhenUnfocused: (id, channel) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, notifyWhenUnfocused: channel } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    setAutoDeleteOnEnd: (id, enabled) => {
      const updated = get().tiles.map((t) =>
        t.id === id ? { ...t, autoDeleteOnEnd: enabled } : t,
      );
      set({ tiles: updated });
      persist(updated);
    },

    findTileByQuery: (query) => {
      return get().tiles.find(
        (t) => t.query.toLowerCase() === query.toLowerCase(),
      );
    },
  }),
);
