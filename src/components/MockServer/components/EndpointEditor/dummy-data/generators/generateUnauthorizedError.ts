import { randomDateIso } from '../utils/randomDateIso'
import { randomId } from '../utils/randomId'

/** Generate a 401 Unauthorized error payload. */
export function generateUnauthorizedError(): unknown {
  return {
    error: {
      code: 'UNAUTHORIZED',
      status: 401,
      message: 'Authentication credentials were missing or invalid.',
      timestamp: randomDateIso(0),
      requestId: randomId()
    }
  }
}
