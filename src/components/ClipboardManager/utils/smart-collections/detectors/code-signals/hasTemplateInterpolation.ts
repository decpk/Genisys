const TEMPLATE_INTERP = /\$\{[^}]+\}/

/** True when text contains a template-literal interpolation (e.g. `${value}`). */
export function hasTemplateInterpolation(text: string): boolean {
  return TEMPLATE_INTERP.test(text)
}
