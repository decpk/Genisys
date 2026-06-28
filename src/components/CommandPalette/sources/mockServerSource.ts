import { useMockServerStore } from '@/store/mock-server-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const mockServerSource: PaletteSource = {
  id: 'mockServer',
  kinds: ['mockendpoint'],
  load: async () => {
    try {
      const state = useMockServerStore.getState() as { loadProjects?: () => Promise<void> }
      await state.loadProjects?.()
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useMockServerStore.getState() as {
        projects?: Array<{ id: string; name: string }>
        servers?: Array<{ id: string; name?: string; projectId?: string }>
        endpoints?: Record<string, Array<{ id: string; method: string; path: string }>>
      }
      const items: PaletteItem[] = []

      for (const project of state.projects ?? []) {
        items.push({
          id: `mockendpoint:project:${project.id}`,
          kind: "mockendpoint",
          title: project.name || "Mock project",
          subtitle: "Mock Server project",
          keywords: [
            "mock",
            "server",
            "project",
            "api",
            "stub",
            "fake",
            "fixture",
          ],
          group: "navigate",
          action: () =>
            safeRun(() =>
              useNavigationStore.getState().setActiveApp("mockserver"),
            ),
        });
      }

      for (const [serverId, endpoints] of Object.entries(state.endpoints ?? {})) {
        for (const ep of endpoints) {
          items.push({
            id: `mockendpoint:${ep.id}`,
            kind: "mockendpoint",
            title: `${ep.method} ${ep.path}`,
            subtitle: "Mock endpoint",
            keywords: [
              "mock",
              "endpoint",
              "api",
              "http",
              "rest",
              serverId,
              ep.method,
              ep.path,
            ],
            group: "navigate",
            action: () =>
              safeRun(() =>
                useNavigationStore.getState().setActiveApp("mockserver"),
              ),
          });
        }
      }

      return items
    } catch {
      return []
    }
  },
}
