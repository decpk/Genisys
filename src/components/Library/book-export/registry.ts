import type { ExportFormat } from './types'

// ─── Export Format Registry ─────────────────────────────────────
// Extensible registry for book export formats.
// New formats (e.g. EPUB, DOCX, Markdown) can be added by calling
// exportRegistry.register(myFormat) during module initialisation.

class ExportFormatRegistry {
  private formats = new Map<string, ExportFormat>()

  register(format: ExportFormat): void {
    this.formats.set(format.id, format)
  }

  unregister(id: string): void {
    this.formats.delete(id)
  }

  get(id: string): ExportFormat | undefined {
    return this.formats.get(id)
  }

  getAll(): ExportFormat[] {
    return Array.from(this.formats.values())
  }
}

export const exportRegistry = new ExportFormatRegistry()
