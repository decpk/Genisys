/** Generate an empty paginated list payload. */
export function generateEmptyList(): unknown {
  return {
    data: [],
    pagination: {
      page: 1,
      pageSize: 0,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  }
}
