import { useState, useEffect, useCallback } from 'react'
import { Cookie, Trash2, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import type { ApiCookieJar, ApiCookie } from '../../APIClient.types'

interface CookieViewerProps {
  workspaceId: string
}

export function CookieViewer(props: CookieViewerProps): React.JSX.Element {
  const { workspaceId } = props
  const [jars, setJars] = useState<ApiCookieJar[]>([])
  const [cookies, setCookies] = useState<Record<string, ApiCookie[]>>({})
  const [expandedJarId, setExpandedJarId] = useState<string | null>(null)

  const loadJars = useCallback(async () => {
    const data = await window.api.apiLoadCookieJars(workspaceId)
    setJars(data ?? [])
  }, [workspaceId])

  const loadCookiesForJar = useCallback(async (jarId: string) => {
    const data = await window.api.apiLoadCookies(jarId)
    setCookies((prev) => ({ ...prev, [jarId]: data ?? [] }))
  }, [])

  useEffect(() => {
    loadJars()
  }, [loadJars])

  useEffect(() => {
    if (expandedJarId) {
      loadCookiesForJar(expandedJarId)
    }
  }, [expandedJarId, loadCookiesForJar])

  const handleClearJar = useCallback(async (jarId: string) => {
    await window.api.apiClearCookieJar(jarId)
    setCookies((prev) => ({ ...prev, [jarId]: [] }))
  }, [])

  const handleRemoveCookie = useCallback(async (cookieId: string, jarId: string) => {
    await window.api.apiRemoveCookie(cookieId)
    setCookies((prev) => ({
      ...prev,
      [jarId]: (prev[jarId] ?? []).filter((c) => c.id !== cookieId),
    }))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <PanelHeading icon={Cookie} title="Cookie Jar" count={jars.length}>
        <Tooltip content="Refresh" side="bottom">
          <IconButton
            onClick={loadJars}
            variant="ghost"
            size="sm"
          >
            <RefreshCw size={13} />
          </IconButton>
        </Tooltip>
      </PanelHeading>

      <div className="h-px bg-border/20 mx-2.5" />

      <div className="flex-1 overflow-y-auto px-1.5 py-1.5">
        {jars.length === 0 ? (
          <EmptyState icon={Cookie} message="No cookies stored yet" />
        ) : (
          jars.map((jar) => {
            const jarCookies = cookies[jar.id] ?? []
            const isExpanded = expandedJarId === jar.id

            return (
              <div key={jar.id} className="mb-1">
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/20 cursor-pointer group"
                  onClick={() => setExpandedJarId(isExpanded ? null : jar.id)}
                >
                  <Cookie size={12} className="text-amber-400/60" />
                  <span className="text-xs font-medium flex-1 truncate">{jar.name}</span>
                  {isExpanded && jarCookies.length > 0 && (
                    <Tooltip content="Clear All" side="left">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleClearJar(jar.id) }}
                        className="p-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                      >
                        <Trash2 size={11} />
                      </button>
                    </Tooltip>
                  )}
                </div>

                {isExpanded && (
                  <div className="ml-4 mt-1 mb-2">
                    {jarCookies.length === 0 ? (
                      <div className="text-2xs text-muted-foreground/40 py-2">No cookies</div>
                    ) : (
                      <div className="space-y-0.5">
                        {jarCookies.map((cookie) => (
                          <div key={cookie.id} className="flex items-start gap-1.5 px-1.5 py-1 rounded hover:bg-muted/10 group/row">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-2xs font-sans font-medium truncate">{cookie.name}</span>
                                <span className="text-3xs text-muted-foreground/30">{cookie.domain}</span>
                              </div>
                              <div className="text-2xs text-muted-foreground/40 font-sans truncate">
                                {cookie.value}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {cookie.secure && <span className="text-3xs bg-emerald-500/10 text-emerald-400 px-1 rounded">Secure</span>}
                                {cookie.httpOnly && <span className="text-3xs bg-blue-500/10 text-blue-400 px-1 rounded">HttpOnly</span>}
                                <span className="text-3xs text-muted-foreground/30">{cookie.sameSite}</span>
                                {cookie.expiresAt && (
                                  <span className="text-3xs text-muted-foreground/30">
                                    Exp: {new Date(cookie.expiresAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveCookie(cookie.id, jar.id)}
                              className="p-0.5 opacity-0 group-hover/row:opacity-100 text-muted-foreground hover:text-red-400 transition-all shrink-0"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
