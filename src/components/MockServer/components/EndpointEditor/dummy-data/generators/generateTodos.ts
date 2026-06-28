import { randomId } from '../utils/randomId'
import { randomBool } from '../utils/randomBool'
import { randomDateIso } from '../utils/randomDateIso'
import { pickOne } from '../utils/pickOne'
import { TODO_TITLES } from '../seeds/todoTitles'

/** Generates an array of fake todo records. */
export function generateTodos(count: number): unknown {
  return Array.from({ length: count }, () => ({
    id: randomId(),
    title: pickOne(TODO_TITLES),
    completed: randomBool(0.4),
    priority: pickOne(['low', 'medium', 'high']),
    dueDate: randomDateIso(30),
    createdAt: randomDateIso()
  }))
}
