import { slugify } from './slugify'

/** Returns a stable avatar URL seeded from the given string. */
export function randomAvatarUrl(seed: string): string {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(slugify(seed))}`
}
