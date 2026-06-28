/**
 * Keyframes for every supported element animation. The animation `type` in the
 * slide model maps directly to a keyframe name here, and the compiler emits
 * this block once per slide.
 */
export const SLIDE_KEYFRAMES_CSS = `
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes slide-up { from { opacity: 0; transform: translateY(8%) } to { opacity: 1; transform: none } }
@keyframes slide-down { from { opacity: 0; transform: translateY(-8%) } to { opacity: 1; transform: none } }
@keyframes slide-left { from { opacity: 0; transform: translateX(8%) } to { opacity: 1; transform: none } }
@keyframes slide-right { from { opacity: 0; transform: translateX(-8%) } to { opacity: 1; transform: none } }
@keyframes zoom { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: none } }
@keyframes bounce {
  0% { opacity: 0; transform: translateY(-12%) }
  60% { opacity: 1; transform: translateY(4%) }
  100% { transform: none }
}
`
