import { createContext, useContext } from 'react'

const AppShellContext = createContext<string | null>(null)

export const AppShellProvider = AppShellContext.Provider

export function useAppShellId(): string | null {
  return useContext(AppShellContext)
}
