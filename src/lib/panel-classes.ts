/**
 * Class string applied to side surfaces (left sidebar, right panel) so they
 * follow the active theme's sidebar token mapping rather than the base card
 * tokens. This keeps the Activity Bar, left panel, and right panel visually
 * consistent across themes (e.g. Noir Warm renders dark side surfaces while
 * the main content stays on the lighter content background).
 *
 * The `sidebar-theme` utility (defined in `src/assets/main.css`) remaps the
 * relevant CSS custom properties — for themes that do not declare a distinct
 * sidebar palette, the remap falls back to the card tokens so the visual
 * behaviour is unchanged.
 */
export const SIDE_PANEL_SURFACE_CLASS = 'sidebar-theme h-full bg-card'
