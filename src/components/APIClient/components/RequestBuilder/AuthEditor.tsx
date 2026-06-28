import { Input } from '@/components/ui/input'
import type { AuthType, AuthData } from '../../APIClient.types'

interface AuthEditorProps {
  authType: AuthType
  authData: AuthData
  onTypeChange: (type: AuthType) => void
  onDataChange: (data: AuthData) => void
}

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'api-key', label: 'API Key' },
]

export function AuthEditor(props: AuthEditorProps): React.JSX.Element {
  const { authType, authData, onTypeChange, onDataChange } = props

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Type selector — segment control */}
      <div className="flex items-center rounded-lg bg-foreground/[0.07] border border-border/50 p-0.5 gap-0.5 shadow-sm w-fit">
        {AUTH_TYPES.map((at) => (
          <button
            key={at.value}
            onClick={() => onTypeChange(at.value)}
            className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
              authType === at.value
                ? 'bg-background text-foreground shadow-sm font-medium border border-border/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {at.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      {authType === 'none' && (
        <div className="rounded-xl border border-dashed border-border/40 px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground/60">
            This request does not use any authorization.
          </p>
        </div>
      )}

      {authType === 'bearer' && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-4 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Token</label>
          <Input
            value={authData.token ?? ''}
            onChange={(e) => onDataChange({ ...authData, token: e.target.value })}
            placeholder="Enter bearer token"
            className="h-9 text-xs font-sans"
          />
          <p className="text-2xs text-muted-foreground/50 italic">Added as Authorization: Bearer &lt;token&gt; header</p>
        </div>
      )}

      {authType === 'basic' && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Username</label>
            <Input
              value={authData.username ?? ''}
              onChange={(e) => onDataChange({ ...authData, username: e.target.value })}
              placeholder="Username"
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <Input
              type="password"
              value={authData.password ?? ''}
              onChange={(e) => onDataChange({ ...authData, password: e.target.value })}
              placeholder="Password"
              className="h-9 text-xs"
            />
          </div>
          <p className="text-2xs text-muted-foreground/50 italic">Sent as Base64-encoded Authorization header</p>
        </div>
      )}

      {authType === 'api-key' && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Key</label>
            <Input
              value={authData.key ?? ''}
              onChange={(e) => onDataChange({ ...authData, key: e.target.value })}
              placeholder="X-API-Key"
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Value</label>
            <Input
              value={authData.value ?? ''}
              onChange={(e) => onDataChange({ ...authData, value: e.target.value })}
              placeholder="API key value"
              className="h-9 text-xs font-sans"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <label className="text-xs text-muted-foreground">Add to:</label>
            <div className="flex items-center rounded-lg bg-foreground/[0.07] border border-border/50 p-0.5 gap-0.5 shadow-sm">
              <button
                onClick={() => onDataChange({ ...authData, addTo: 'header' })}
                className={`px-2 py-0.5 text-xs rounded-md transition-all cursor-pointer ${
                  authData.addTo !== 'query' ? 'bg-background text-foreground shadow-sm border border-border/30' : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                Header
              </button>
              <button
                onClick={() => onDataChange({ ...authData, addTo: 'query' })}
                className={`px-2 py-0.5 text-xs rounded-md transition-all cursor-pointer ${
                  authData.addTo === 'query' ? 'bg-background text-foreground shadow-sm border border-border/30' : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                Query Param
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
