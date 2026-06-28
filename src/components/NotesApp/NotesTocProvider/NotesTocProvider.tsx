import { NotesTocContext } from './NotesTocProvider.context'
import { useNotesTocProviderData } from './useNotesTocProviderData'

export function NotesTocProvider(props: { children: React.ReactNode }): React.JSX.Element {
  const { children } = props
  const value = useNotesTocProviderData()
  return <NotesTocContext.Provider value={value}>{children}</NotesTocContext.Provider>
}
