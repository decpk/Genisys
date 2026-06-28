import { randomId } from '../utils/randomId'
import { randomInt } from '../utils/randomInt'
import { randomBool } from '../utils/randomBool'
import { randomDateIso } from '../utils/randomDateIso'
import { randomSentence } from '../utils/randomSentence'
import { pickOne } from '../utils/pickOne'
import { NOTIFICATION_TYPES } from '../seeds/notificationTypes'

/** Generates an array of fake notification records. */
export function generateNotifications(count: number): unknown {
  return Array.from({ length: count }, () => ({
    id: randomId(),
    type: pickOne(NOTIFICATION_TYPES),
    title: randomSentence(randomInt(3, 5)),
    message: randomSentence(randomInt(8, 14)),
    read: randomBool(0.5),
    createdAt: randomDateIso(7)
  }))
}
