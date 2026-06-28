import { createContext, useContext, useId } from 'react'

const InstanceIdContext = createContext<string | null>(null)

export function InstanceIdProvider({
  instanceId,
  children,
}: {
  instanceId?: string
  children: React.ReactNode
}): React.JSX.Element {
  const autoId = useId()
  const resolvedId = instanceId ?? autoId

  return (
    <InstanceIdContext.Provider value={resolvedId}>
      {children}
    </InstanceIdContext.Provider>
  )
}

export function useInstanceId(): string {
  const id = useContext(InstanceIdContext)
  if (!id) {
    throw new Error('useInstanceId() must be used inside InstanceIdProvider.')
  }
  return id
}
