import { randomDateIso } from '../utils/randomDateIso'
import { randomId } from '../utils/randomId'

/** Generate a 404 Not Found error payload. */
export function generateNotFoundError(): unknown {
  return {
    error: {
      code: 'NOT_FOUND',
      status: 404,
      message: 'The requested resource could not be found.',
      timestamp: randomDateIso(0),
      requestId: randomId()
    }
  }
}
