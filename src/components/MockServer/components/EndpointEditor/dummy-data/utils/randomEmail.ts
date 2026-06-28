import { pickOne } from './pickOne'

const EMAIL_DOMAINS: readonly string[] = ['example.com', 'mail.com', 'test.dev', 'acme.io']

/** Builds a deterministic-looking email from a first and last name. */
export function randomEmail(firstName: string, lastName: string): string {
  const domain = pickOne(EMAIL_DOMAINS)
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
}
