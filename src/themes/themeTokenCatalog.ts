/** Per-token metadata used by the custom theme editor — keep in sync with `ThemeColors`. */

import type { ThemeTokenInfo } from './themeTokenCatalog.types'

export const THEME_TOKEN_CATALOG: ReadonlyArray<ThemeTokenInfo> = [
  // ── Surface ───────────────────────────────────────────────
  {
    key: 'background',
    label: 'Page background',
    description:
      'The base canvas color used for the main app surface. Should be the most-used neutral tone in the theme.',
    group: 'surface',
    exampleUsage: 'App body, main content area',
  },
  {
    key: 'card',
    label: 'Card surface',
    description:
      'Background for cards, panels, and elevated containers that sit above the page background.',
    group: 'surface',
    exampleUsage: 'Dashboard cards, modal bodies',
  },
  {
    key: 'popover',
    label: 'Popover surface',
    description: 'Background for floating menus, dropdowns, tooltips, and popovers.',
    group: 'surface',
    exampleUsage: 'Dropdown menus, tooltips',
  },
  {
    key: 'muted',
    label: 'Muted surface',
    description:
      'Subtle background for de-emphasised areas like skeletons, hover states, and secondary panels.',
    group: 'surface',
    exampleUsage: 'Hover backgrounds, skeleton loaders',
  },
  {
    key: 'secondary',
    label: 'Secondary surface',
    description: 'Background for secondary buttons, chips, and low-emphasis containers.',
    group: 'surface',
    exampleUsage: 'Secondary buttons, chips',
  },
  {
    key: 'accent',
    label: 'Accent surface',
    description: 'Highlight background for hovered list items, selected rows, and accentuated strips.',
    group: 'surface',
    exampleUsage: 'Selected list items, hover rows',
  },
  {
    key: 'border',
    label: 'Border',
    description:
      'Default border color used across cards, dividers, and panel edges. Input borders are auto-derived from the primary color (subtle, mode-adaptive) and are not edited here.',
    group: 'surface',
    exampleUsage: 'Card edges, dividers',
  },

  // ── Text ──────────────────────────────────────────────────
  {
    key: 'foreground',
    label: 'Foreground text',
    description: 'Default text color on top of the page background.',
    group: 'text',
    exampleUsage: 'Body copy, headings on background',
  },
  {
    key: 'card-foreground',
    label: 'Card text',
    description: 'Text color used inside cards and elevated panels.',
    group: 'text',
    exampleUsage: 'Card titles, body text inside cards',
  },
  {
    key: 'popover-foreground',
    label: 'Popover text',
    description: 'Text color used inside popovers, menus, and tooltips.',
    group: 'text',
    exampleUsage: 'Menu items, tooltip text',
  },
  {
    key: 'secondary-foreground',
    label: 'Secondary text',
    description: 'Text color used on secondary surfaces — buttons, chips, and badges.',
    group: 'text',
    exampleUsage: 'Secondary button labels, chip text',
  },
  {
    key: 'muted-foreground',
    label: 'Muted text',
    description:
      'Subdued text color for captions, hints, and metadata. Should still be readable on the muted surface.',
    group: 'text',
    exampleUsage: 'Captions, helper text, metadata',
  },
  {
    key: 'accent-foreground',
    label: 'Accent text',
    description: 'Text color when sitting on top of an accent background (hovered/selected items).',
    group: 'text',
    exampleUsage: 'Active list-item label',
  },

  // ── Interactive ───────────────────────────────────────────
  {
    key: 'primary',
    label: 'Primary brand',
    description:
      'Brand color used for the active button, focused inputs, and highlighted text. Should contrast strongly against the page background.',
    group: 'interactive',
    exampleUsage: 'Primary buttons, focus accents, links',
  },
  {
    key: 'primary-foreground',
    label: 'Primary text',
    description: 'Text color used on top of the primary brand color (e.g. text inside a primary button).',
    group: 'interactive',
    exampleUsage: 'Primary button label',
  },
  {
    key: 'ring',
    label: 'Focus ring',
    description: 'Outline color shown around keyboard-focused inputs, buttons, and interactive elements.',
    group: 'interactive',
    exampleUsage: 'Keyboard focus outline',
  },

  // ── Feedback ──────────────────────────────────────────────
  {
    key: 'destructive',
    label: 'Destructive',
    description: 'Color used for delete actions, error states, and other destructive operations.',
    group: 'feedback',
    exampleUsage: 'Delete button, error toasts',
  },
  {
    key: 'destructive-foreground',
    label: 'Destructive text',
    description: 'Text color used on top of a destructive background (e.g. inside a delete button).',
    group: 'feedback',
    exampleUsage: 'Delete button label',
  },
  {
    key: 'success',
    label: 'Success',
    description: 'Color used for success states, completed checkboxes, and positive feedback.',
    group: 'feedback',
    exampleUsage: 'Success toasts, completed badges',
  },
  {
    key: 'warning',
    label: 'Warning',
    description: 'Color used for warning states, caution messages, and pending operations.',
    group: 'feedback',
    exampleUsage: 'Warning toasts, pending badges',
  },
  {
    key: 'info',
    label: 'Info',
    description: 'Color used for informational badges, neutral notifications, and secondary highlights.',
    group: 'feedback',
    exampleUsage: 'Info banners, neutral badges',
  },

  // ── Sidebar (optional, falls back) ────────────────────────
  {
    key: 'sidebar',
    label: 'Sidebar surface',
    description: 'Background of the side panel and activity bar. Falls back to the card surface when blank.',
    group: 'sidebar',
    exampleUsage: 'Activity bar, side panel background',
    optional: true,
  },
  {
    key: 'sidebar-foreground',
    label: 'Sidebar text',
    description: 'Default text color inside the sidebar. Falls back to the card text color when blank.',
    group: 'sidebar',
    exampleUsage: 'Sidebar item labels',
    optional: true,
  },
  {
    key: 'sidebar-border',
    label: 'Sidebar border',
    description: 'Border color between sidebar sections. Falls back to the default border when blank.',
    group: 'sidebar',
    exampleUsage: 'Sidebar dividers',
    optional: true,
  },
  {
    key: 'sidebar-accent',
    label: 'Sidebar accent',
    description:
      'Highlight background for hovered or active sidebar items. Falls back to the secondary surface when blank.',
    group: 'sidebar',
    exampleUsage: 'Active sidebar item background',
    optional: true,
  },
  {
    key: 'sidebar-accent-foreground',
    label: 'Sidebar accent text',
    description: 'Text color on top of the sidebar accent. Falls back to the secondary text color when blank.',
    group: 'sidebar',
    exampleUsage: 'Active sidebar item label',
    optional: true,
  },
  {
    key: 'sidebar-muted',
    label: 'Sidebar muted',
    description: 'Subtle background inside the sidebar. Falls back to the muted surface when blank.',
    group: 'sidebar',
    exampleUsage: 'Sidebar section backgrounds',
    optional: true,
  },
  {
    key: 'sidebar-muted-foreground',
    label: 'Sidebar muted text',
    description: 'Subdued text inside the sidebar. Falls back to the muted text color when blank.',
    group: 'sidebar',
    exampleUsage: 'Sidebar captions, secondary labels',
    optional: true,
  },
]
