/**
 * Custom-element tags MUST contain a hyphen so they never collide with standard
 * HTML elements or with prose. Throws in dev if a block tag is malformed.
 */
export function assertHyphenatedTag(tag: string): void {
  if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(tag)) {
    throw new Error(
      `[block-kit] Invalid block tag "${tag}". Tags must be lowercase and contain a hyphen (e.g. "lib-callout").`,
    )
  }
}
