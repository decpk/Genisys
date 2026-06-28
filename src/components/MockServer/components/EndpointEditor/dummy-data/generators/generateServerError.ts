import { randomDateIso } from '../utils/randomDateIso'
import { randomId } from '../utils/randomId'

/** Generate a 500 Internal Server Error payload. */
export function generateServerError(): unknown {
  return {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      message: 'An unexpected error occurred. Please try again later.',
      timestamp: randomDateIso(0),
      requestId: randomId()
    }
  }
}
