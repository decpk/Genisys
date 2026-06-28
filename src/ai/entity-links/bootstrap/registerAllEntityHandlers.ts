// Importing each handler module triggers its registerEntityLink() call (side-effect).
import '@/ai/entity-links/handlers/clipboard'

export function registerAllEntityHandlers(): void {
  // No-op: registration happens via the side-effect imports above.
  // This function exists so app bootstrap has an explicit, type-checked call site.
}
