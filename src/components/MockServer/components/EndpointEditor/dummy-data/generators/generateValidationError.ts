import { randomDateIso } from '../utils/randomDateIso'
import { randomId } from '../utils/randomId'

/** Generate a 422 Validation error payload. */
export function generateValidationError(): unknown {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      status: 422,
      message: 'One or more fields failed validation.',
      fields: [
        { field: 'email', message: 'Email is required.' },
        { field: 'password', message: 'Password must be at least 8 characters.' }
      ],
      timestamp: randomDateIso(0),
      requestId: randomId()
    }
  }
}
