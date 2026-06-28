import type { AuthType, AuthData } from '../../../APIClient.types'
import type { InsomniaAuth } from './insomnia.types'

/**
 * Map an Insomnia authentication block to a normalized auth type and
 * data payload. Unknown or unsupported schemes degrade to 'none'.
 */
export function mapInsomniaAuth(
  authentication: InsomniaAuth | undefined
): { authType: AuthType; authData: AuthData } {
  const type = (authentication?.type ?? '').toLowerCase()

  if (type === 'bearer') {
    return { authType: 'bearer', authData: { token: authentication?.token ?? '' } }
  }

  if (type === 'basic') {
    return {
      authType: 'basic',
      authData: {
        username: authentication?.username ?? '',
        password: authentication?.password ?? '',
      },
    }
  }

  if (type === 'apikey') {
    return {
      authType: 'api-key',
      authData: {
        key: authentication?.key ?? '',
        value: authentication?.value ?? '',
        addTo: normalizeAddTo(authentication?.addTo),
      },
    }
  }

  return { authType: 'none', authData: {} }
}

function normalizeAddTo(addTo: string | undefined): 'header' | 'query' {
  if (addTo === 'query') return 'query'
  return 'header'
}
