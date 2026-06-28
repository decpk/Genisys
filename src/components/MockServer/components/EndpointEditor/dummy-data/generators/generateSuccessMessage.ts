import { randomDateIso } from '../utils/randomDateIso'
import { randomId } from '../utils/randomId'

/** Generate a generic success message payload. */
export function generateSuccessMessage(): unknown {
  return {
    success: true,
    message: 'Operation completed successfully.',
    timestamp: randomDateIso(0),
    requestId: randomId()
  }
}
