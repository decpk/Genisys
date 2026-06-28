export const sectionShellStyles = {
  // Neumorphic raised card — the section appears extruded "out" of the page
  // via a dark drop shadow (bottom-right) paired with a soft light highlight
  // (top-left). Variant `shellClass` supplies the surface tint.
  shellBase:
    'relative isolate rounded-2xl overflow-hidden shadow-[2px_2px_5px_rgba(0,0,0,0.12),-2px_-2px_5px_rgba(255,255,255,0.015)]',
  content: 'relative',
} as const
