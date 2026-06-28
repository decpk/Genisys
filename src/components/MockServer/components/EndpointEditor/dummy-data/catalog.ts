import type { DummyDataCategory } from './dummyData.types'

import { generateUsers } from './generators/generateUsers'
import { generateProducts } from './generators/generateProducts'
import { generatePosts } from './generators/generatePosts'
import { generateComments } from './generators/generateComments'
import { generateOrders } from './generators/generateOrders'
import { generateTodos } from './generators/generateTodos'
import { generateTransactions } from './generators/generateTransactions'
import { generateCompanies } from './generators/generateCompanies'
import { generateNotifications } from './generators/generateNotifications'
import { generatePaginatedUsers } from './generators/generatePaginatedUsers'
import { generateNotFoundError } from './generators/generateNotFoundError'
import { generateValidationError } from './generators/generateValidationError'
import { generateUnauthorizedError } from './generators/generateUnauthorizedError'
import { generateServerError } from './generators/generateServerError'
import { generateSuccessMessage } from './generators/generateSuccessMessage'
import { generateEmptyList } from './generators/generateEmptyList'

/**
 * Registry of every dummy-data category shown in the "Add dummy data" modal.
 * Order here is the display order within each group.
 */
export const DUMMY_DATA_CATEGORIES: readonly DummyDataCategory[] = [
  // --- Collections (array payloads, honor count) ---
  {
    id: 'users',
    name: 'Users',
    description: 'List of user profiles with name, email and avatar.',
    group: 'collections',
    supportsCount: true,
    generate: generateUsers,
  },
  {
    id: 'products',
    name: 'Products',
    description: 'Catalog items with price, SKU and stock.',
    group: 'collections',
    supportsCount: true,
    generate: generateProducts,
  },
  {
    id: 'posts',
    name: 'Blog Posts',
    description: 'Articles with title, body, author and tags.',
    group: 'collections',
    supportsCount: true,
    generate: generatePosts,
  },
  {
    id: 'comments',
    name: 'Comments',
    description: 'User comments linked to posts.',
    group: 'collections',
    supportsCount: true,
    generate: generateComments,
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'E-commerce orders with customer and totals.',
    group: 'collections',
    supportsCount: true,
    generate: generateOrders,
  },
  {
    id: 'todos',
    name: 'Todos',
    description: 'Task items with priority and due date.',
    group: 'collections',
    supportsCount: true,
    generate: generateTodos,
  },
  {
    id: 'transactions',
    name: 'Transactions',
    description: 'Financial transactions with amount and status.',
    group: 'collections',
    supportsCount: true,
    generate: generateTransactions,
  },
  {
    id: 'companies',
    name: 'Companies',
    description: 'Organizations with industry and headcount.',
    group: 'collections',
    supportsCount: true,
    generate: generateCompanies,
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'In-app notifications with type and read state.',
    group: 'collections',
    supportsCount: true,
    generate: generateNotifications,
  },

  // --- Responses (envelope payloads) ---
  {
    id: 'paginated-users',
    name: 'Paginated List',
    description: 'Users wrapped in a data + pagination envelope.',
    group: 'responses',
    supportsCount: true,
    generate: generatePaginatedUsers,
  },
  {
    id: 'empty-list',
    name: 'Empty List',
    description: 'Empty data array with zeroed pagination.',
    group: 'responses',
    supportsCount: false,
    generate: generateEmptyList,
  },
  {
    id: 'success-message',
    name: 'Success Message',
    description: 'Generic success acknowledgement payload.',
    group: 'responses',
    supportsCount: false,
    generate: generateSuccessMessage,
  },
  {
    id: 'error-not-found',
    name: 'Error · 404 Not Found',
    description: 'Standard not-found error envelope.',
    group: 'responses',
    supportsCount: false,
    generate: generateNotFoundError,
  },
  {
    id: 'error-validation',
    name: 'Error · 422 Validation',
    description: 'Validation error with field-level messages.',
    group: 'responses',
    supportsCount: false,
    generate: generateValidationError,
  },
  {
    id: 'error-unauthorized',
    name: 'Error · 401 Unauthorized',
    description: 'Missing or invalid authentication error.',
    group: 'responses',
    supportsCount: false,
    generate: generateUnauthorizedError,
  },
  {
    id: 'error-server',
    name: 'Error · 500 Server',
    description: 'Internal server error envelope.',
    group: 'responses',
    supportsCount: false,
    generate: generateServerError,
  },
]
