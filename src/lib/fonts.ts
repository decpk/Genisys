import type { ReadingFont } from '@/store/settings-store'

export const FONT_CONFIG: Record<ReadingFont, { family: string; label: string }> = {
  system: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    label: 'Sans',
  },
  serif: {
    family: 'Georgia, "Times New Roman", "Iowan Old Style", "Palatino Linotype", serif',
    label: 'Serif',
  },
  mono: {
    family: '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, Consolas, monospace',
    label: 'Mono',
  },
  literata: {
    family: '"Literata Variable", Georgia, serif',
    label: 'Literata',
  },
  lora: {
    family: '"Lora Variable", Georgia, serif',
    label: 'Lora',
  },
  'source-serif': {
    family: '"Source Serif 4 Variable", Georgia, serif',
    label: 'Source Serif',
  },
  inter: {
    family: '"Inter Variable", system-ui, sans-serif',
    label: 'Inter',
  },
  newsreader: {
    family: '"Newsreader Variable", Georgia, serif',
    label: 'Newsreader',
  },
  'crimson-pro': {
    family: '"Crimson Pro Variable", Georgia, serif',
    label: 'Crimson Pro',
  },
  'ia-writer-quattro': {
    family: '"iA Writer Quattro", Georgia, serif',
    label: 'iA Writer Quattro',
  },
  geist: {
    family: '"Geist Variable", system-ui, sans-serif',
    label: 'Geist',
  },
  'geist-mono': {
    family: '"Geist Mono Variable", ui-monospace, SFMono-Regular, monospace',
    label: 'Geist Mono',
  },
  poppins: {
    family: '"Poppins", system-ui, sans-serif',
    label: 'Poppins',
  },
  'segoe-ui': {
    family: '"Segoe UI", "Segoe UI Web", system-ui, sans-serif',
    label: 'Segoe UI',
  },
  'cascadia-code': {
    family: '"Cascadia Code Variable", ui-monospace, "Consolas", monospace',
    label: 'Cascadia Code',
  },
  'ubuntu-sans': {
    family: '"Ubuntu Sans Variable", system-ui, sans-serif',
    label: 'Ubuntu Sans',
  },
  'fira-sans': {
    family: '"Fira Sans", system-ui, sans-serif',
    label: 'Fira Sans',
  },
}

export const FONT_OPTIONS = Object.keys(FONT_CONFIG) as ReadingFont[]

export const READING_FONT_OPTIONS: { value: ReadingFont; label: string }[] = FONT_OPTIONS.map(
  (key) => ({ value: key, label: FONT_CONFIG[key].label })
)

/**
 * Font options for code editors and terminals.
 *
 * Two groups:
 *   1. **Monospace** — purpose-built coding fonts (recommended).
 *   2. **App fonts** — every font from `FONT_CONFIG` (the same catalogue used by
 *      the global "App font" setting). Non-mono picks still render in xterm /
 *      Monaco; they are appended to a monospace fallback at the consumer.
 *
 * The `value` is the literal CSS `font-family` stack to apply.
 * `null` represents "System default".
 */
export const MONOSPACE_FONT_OPTIONS: { value: string | null; label: string; group: 'system' | 'mono' | 'app' }[] = [
  { value: null, label: 'System default', group: 'system' },

  // Monospace — coding fonts
  { value: '"JetBrains Mono", ui-monospace, monospace', label: 'JetBrains Mono', group: 'mono' },
  { value: '"Fira Code", ui-monospace, monospace', label: 'Fira Code', group: 'mono' },
  { value: '"Cascadia Code Variable", "Cascadia Code", ui-monospace, monospace', label: 'Cascadia Code', group: 'mono' },
  { value: '"Geist Mono Variable", ui-monospace, SFMono-Regular, monospace', label: 'Geist Mono', group: 'mono' },
  { value: '"SF Mono", ui-monospace, monospace', label: 'SF Mono', group: 'mono' },
  { value: 'Menlo, ui-monospace, monospace', label: 'Menlo', group: 'mono' },
  { value: 'Monaco, ui-monospace, monospace', label: 'Monaco', group: 'mono' },
  { value: 'Consolas, ui-monospace, monospace', label: 'Consolas', group: 'mono' },
  { value: '"Source Code Pro", ui-monospace, monospace', label: 'Source Code Pro', group: 'mono' },
  { value: '"IBM Plex Mono", ui-monospace, monospace', label: 'IBM Plex Mono', group: 'mono' },

  // App fonts — same catalogue as the global "App font" setting
  ...FONT_OPTIONS.map((key) => ({
    value: FONT_CONFIG[key].family,
    label: FONT_CONFIG[key].label,
    group: 'app' as const,
  })),
]
