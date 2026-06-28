import type { AuthType, AuthData } from '@/components/APIClient/APIClient.types'
import type { PostmanAuth } from './postman.types'
import { readAuthAttribute } from './readAuthAttribute'
import { resolveApiKeyTarget } from './resolveApiKeyTarget'

interface MappedAuth {
  authType: AuthType
  authData: AuthData
}

const NONE_AUTH: MappedAuth = { authType: 'none', authData: {} }

/**
 * Map a Postman auth block onto the normalized `{ authType, authData }`.
 * Unsupported/missing auth defaults gracefully to `none`.
 */
export function mapPostmanAuth(auth: PostmanAuth | undefined): MappedAuth {
  if (!auth || !auth.type) return NONE_AUTH

  if (auth.type === 'bearer') {
    return {
      authType: 'bearer',
      authData: { token: readAuthAttribute(auth.bearer, 'token') },
    }
  }

  if (auth.type === 'basic') {
    return {
      authType: 'basic',
      authData: {
        username: readAuthAttribute(auth.basic, 'username'),
        password: readAuthAttribute(auth.basic, 'password'),
      },
    }
  }

  if (auth.type === 'apikey') {
    const addTo = resolveApiKeyTarget(readAuthAttribute(auth.apikey, 'in'))
    return {
      authType: 'api-key',
      authData: {
        key: readAuthAttribute(auth.apikey, 'key'),
        value: readAuthAttribute(auth.apikey, 'value'),
        addTo,
      },
    }
  }

  return NONE_AUTH
}
