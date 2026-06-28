import { randomDateIso } from '../utils/randomDateIso'
import { randomId } from '../utils/randomId'
import { generateUsers } from './generateUsers'

/** Generate a paginated users response payload. */
export function generatePaginatedUsers(count: number): unknown {
  return {
    data: generateUsers(count),
    pagination: {
      page: 1,
      pageSize: count,
      total: count * 5,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: false
    },
    meta: {
      requestId: randomId(),
      timestamp: randomDateIso(0)
    }
  }
}
