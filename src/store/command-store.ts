import { create } from 'zustand'

export interface ChatCommand {
  id: string
  name: string
  description: string
  toolName: string
  argsTemplate: string
  isBuiltIn: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface CommandState {
  commands: ChatCommand[]
  isLoaded: boolean
}

interface CommandActions {
  loadCommands: () => Promise<void>
  addCommand: (name: string, description: string, toolName: string, argsTemplate: string) => Promise<void>
  updateCommand: (id: string, updates: Partial<Pick<ChatCommand, 'name' | 'description' | 'toolName' | 'argsTemplate'>>) => Promise<void>
  removeCommand: (id: string) => Promise<void>
}

export const useCommandStore = create<CommandState & CommandActions>()((set, get) => ({
  commands: [],
  isLoaded: false,

  loadCommands: async () => {
    if (get().isLoaded) return
    try {
      const commands = (await window.api.loadCommands()) as ChatCommand[]
      set({ commands, isLoaded: true })
    } catch {
      set({ commands: [], isLoaded: true })
    }
  },

  addCommand: async (name, description, toolName, argsTemplate) => {
    const now = new Date().toISOString()
    const command: ChatCommand = {
      id: crypto.randomUUID(),
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      toolName,
      argsTemplate,
      isBuiltIn: false,
      sortOrder: get().commands.length,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ commands: [...state.commands, command] }))
    try {
      await window.api.saveCommand(command)
    } catch {
      // Optimistic update — keep in-memory even if backend fails
    }
  },

  updateCommand: async (id, updates) => {
    const command = get().commands.find((c) => c.id === id)
    if (!command || command.isBuiltIn) return
    const updated = { ...command, ...updates, updatedAt: new Date().toISOString() }
    if (updates.name) updated.name = updates.name.toLowerCase().replace(/\s+/g, '-')
    set((state) => ({
      commands: state.commands.map((c) => (c.id === id ? updated : c)),
    }))
    try {
      await window.api.saveCommand(updated)
    } catch {
      // Optimistic update
    }
  },

  removeCommand: async (id) => {
    const command = get().commands.find((c) => c.id === id)
    if (!command || command.isBuiltIn) return
    set((state) => ({ commands: state.commands.filter((c) => c.id !== id) }))
    try {
      await window.api.removeCommand(id)
    } catch {
      // Optimistic update
    }
  },
}))
